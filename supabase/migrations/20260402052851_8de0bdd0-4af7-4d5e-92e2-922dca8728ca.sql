
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- USERS TABLE (profiles)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'Colombia',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  claims_used INTEGER NOT NULL DEFAULT 0,
  ocr_extractions_today INTEGER NOT NULL DEFAULT 0,
  ocr_last_reset DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- CLAIMS TABLE
-- ============================================
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  claim_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'sent', 'resolved', 'closed')),
  situation_description TEXT NOT NULL DEFAULT '',
  counterparty_name TEXT NOT NULL DEFAULT '',
  counterparty_type TEXT NOT NULL DEFAULT 'company' CHECK (counterparty_type IN ('person', 'company', 'government_entity')),
  amount_involved NUMERIC,
  incident_date DATE,
  generated_document TEXT,
  instructions TEXT,
  legal_rights JSONB,
  deadline_date DATE,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  share_token UUID UNIQUE,
  share_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims" ON public.claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own claims" ON public.claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own claims" ON public.claims FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own claims" ON public.claims FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view shared claims" ON public.claims FOR SELECT USING (share_enabled = true AND share_token IS NOT NULL);

-- ============================================
-- CLAIM TIMELINE
-- ============================================
CREATE TABLE public.claim_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.claim_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timeline" ON public.claim_timeline FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.claims WHERE claims.id = claim_timeline.claim_id AND claims.user_id = auth.uid()));
CREATE POLICY "Users can insert own timeline" ON public.claim_timeline FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.claims WHERE claims.id = claim_timeline.claim_id AND claims.user_id = auth.uid()));

-- ============================================
-- DOCUMENTS (file attachments)
-- ============================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.claims WHERE claims.id = documents.claim_id AND claims.user_id = auth.uid()));
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.claims WHERE claims.id = documents.claim_id AND claims.user_id = auth.uid()));
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.claims WHERE claims.id = documents.claim_id AND claims.user_id = auth.uid()));

-- ============================================
-- LEGAL KNOWLEDGE (RAG)
-- ============================================
CREATE TABLE public.legal_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  source TEXT NOT NULL,
  claim_type TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read legal knowledge" ON public.legal_knowledge FOR SELECT USING (true);

-- ============================================
-- CLAIM EMBEDDINGS (RAG)
-- ============================================
CREATE TABLE public.claim_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.claim_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings" ON public.claim_embeddings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own embeddings" ON public.claim_embeddings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own embeddings" ON public.claim_embeddings FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ASSISTANT CONVERSATIONS
-- ============================================
CREATE TABLE public.assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.assistant_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.assistant_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.assistant_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.assistant_conversations FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_claims_user_id ON public.claims(user_id);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_share_token ON public.claims(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_claim_timeline_claim_id ON public.claim_timeline(claim_id);
CREATE INDEX idx_documents_claim_id ON public.documents(claim_id);
CREATE INDEX idx_claim_embeddings_claim_id ON public.claim_embeddings(claim_id);
CREATE INDEX idx_assistant_conversations_user_id ON public.assistant_conversations(user_id);

-- IVFFlat indexes for vector similarity search
CREATE INDEX ON public.legal_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON public.claim_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Decrement claims used
CREATE OR REPLACE FUNCTION public.decrement_claims_used(uid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.users SET claims_used = GREATEST(claims_used - 1, 0) WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Match legal knowledge (vector similarity)
CREATE OR REPLACE FUNCTION public.match_legal_knowledge(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 5,
  filter_claim_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  content_type TEXT,
  source TEXT,
  claim_type TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lk.id,
    lk.content,
    lk.content_type,
    lk.source,
    lk.claim_type,
    1 - (lk.embedding <=> query_embedding) AS similarity
  FROM public.legal_knowledge lk
  WHERE
    (filter_claim_type IS NULL OR lk.claim_type IS NULL OR lk.claim_type = filter_claim_type)
    AND lk.embedding IS NOT NULL
    AND 1 - (lk.embedding <=> query_embedding) > match_threshold
  ORDER BY lk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Match claim embeddings (vector similarity)
CREATE OR REPLACE FUNCTION public.match_claim_embeddings(
  query_embedding vector(1536),
  p_claim_id UUID,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.chunk_text,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM public.claim_embeddings ce
  WHERE ce.claim_id = p_claim_id
    AND ce.embedding IS NOT NULL
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Handle new user signup: auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, country)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'country', 'Colombia')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.assistant_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-documents', 'claim-documents', false);

CREATE POLICY "Users can view own files" ON storage.objects FOR SELECT USING (bucket_id = 'claim-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload own files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'claim-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'claim-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
