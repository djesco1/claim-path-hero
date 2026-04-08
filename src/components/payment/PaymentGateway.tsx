import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Building2, Smartphone, Check, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlassCard } from '@/components/shared/GlassCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type PaymentMethod = 'card' | 'pse' | 'nequi';

const colombianBanks = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA Colombia',
  'Banco Popular',
  'Banco Occidente',
  'Banco Caja Social',
  'Banco AV Villas',
  'Banco Agrario',
  'Banco Falabella',
  'Banco Pichincha',
  'Banco Cooperativo Coopcentral',
  'Banco Santander',
  'Scotiabank Colpatria',
];

interface PaymentGatewayProps {
  amount: number;
  planName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentGateway({ amount, planName, onSuccess, onCancel }: PaymentGatewayProps) {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');

  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // PSE form
  const [pseBank, setPseBank] = useState('');
  const [pseDocType, setPseDocType] = useState('CC');
  const [pseDocNumber, setPseDocNumber] = useState('');
  const [pseEmail, setPseEmail] = useState('');

  // Nequi form
  const [nequiPhone, setNequiPhone] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace(/\//g, '').length <= 4) {
      setCardExpiry(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      setCardCvv(value);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setStep('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setProcessing(false);
    setStep('success');

    // Call success callback after showing success message
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  const isCardValid = cardNumber.replace(/\s/g, '').length === 16 && 
                      cardName.length > 0 && 
                      cardExpiry.length === 5 && 
                      cardCvv.length >= 3;

  const isPseValid = pseBank && pseDocNumber.length > 0 && pseEmail.length > 0;
  const isNequiValid = nequiPhone.length === 10;

  const canProceed = method === 'card' ? isCardValid : method === 'pse' ? isPseValid : isNequiValid;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 'method' && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Método de pago</h3>
              <p className="text-sm text-muted-foreground">Selecciona cómo deseas pagar</p>
            </div>

            <div className="grid gap-4">
              <GlassCard
                className={cn(
                  'p-4 cursor-pointer transition-all',
                  method === 'card' && 'ring-2 ring-primary/50'
                )}
                glow={method === 'card'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMethod('card')}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'rounded-xl p-3',
                    method === 'card' ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <CreditCard className={cn(
                      'h-6 w-6',
                      method === 'card' ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Tarjeta de crédito/débito</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                  </div>
                  {method === 'card' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Check className="h-5 w-5 text-primary" />
                    </motion.div>
                  )}
                </div>
              </GlassCard>

              <GlassCard
                className={cn(
                  'p-4 cursor-pointer transition-all',
                  method === 'pse' && 'ring-2 ring-primary/50'
                )}
                glow={method === 'pse'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMethod('pse')}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'rounded-xl p-3',
                    method === 'pse' ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <Building2 className={cn(
                      'h-6 w-6',
                      method === 'pse' ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">PSE</p>
                    <p className="text-sm text-muted-foreground">Pago desde tu banco</p>
                  </div>
                  {method === 'pse' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Check className="h-5 w-5 text-primary" />
                    </motion.div>
                  )}
                </div>
              </GlassCard>

              <GlassCard
                className={cn(
                  'p-4 cursor-pointer transition-all',
                  method === 'nequi' && 'ring-2 ring-primary/50'
                )}
                glow={method === 'nequi'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMethod('nequi')}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'rounded-xl p-3',
                    method === 'nequi' ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <Smartphone className={cn(
                      'h-6 w-6',
                      method === 'nequi' ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Nequi</p>
                    <p className="text-sm text-muted-foreground">Pago con tu celular</p>
                  </div>
                  {method === 'nequi' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Check className="h-5 w-5 text-primary" />
                    </motion.div>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => setStep('details')} className="flex-1 bg-gradient-to-r from-primary to-purple-600">
                Continuar
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setStep('method')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="text-xl font-bold text-foreground">Detalles de pago</h3>
                <p className="text-sm text-muted-foreground">
                  {method === 'card' && 'Ingresa los datos de tu tarjeta'}
                  {method === 'pse' && 'Selecciona tu banco'}
                  {method === 'nequi' && 'Ingresa tu número Nequi'}
                </p>
              </div>
            </div>

            <GlassCard className="p-6" glow>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan {planName}</p>
                  <p className="text-2xl font-bold text-foreground">${amount.toLocaleString('es-CO')}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Pago seguro</span>
                </div>
              </div>

              {method === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Número de tarjeta</Label>
                    <Input
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="bg-white/50 backdrop-blur-sm border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre en la tarjeta</Label>
                    <Input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="JUAN PEREZ"
                      className="bg-white/50 backdrop-blur-sm border-white/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vencimiento</Label>
                      <Input
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/AA"
                        className="bg-white/50 backdrop-blur-sm border-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input
                        value={cardCvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        type="password"
                        className="bg-white/50 backdrop-blur-sm border-white/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'pse' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Select value={pseBank} onValueChange={setPseBank}>
                      <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/20">
                        <SelectValue placeholder="Selecciona tu banco" />
                      </SelectTrigger>
                      <SelectContent>
                        {colombianBanks.map(bank => (
                          <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de documento</Label>
                      <Select value={pseDocType} onValueChange={setPseDocType}>
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                          <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                          <SelectItem value="NIT">NIT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Número de documento</Label>
                      <Input
                        value={pseDocNumber}
                        onChange={(e) => setPseDocNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="1234567890"
                        className="bg-white/50 backdrop-blur-sm border-white/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={pseEmail}
                      onChange={(e) => setPseEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="bg-white/50 backdrop-blur-sm border-white/20"
                    />
                  </div>
                </div>
              )}

              {method === 'nequi' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Número de celular Nequi</Label>
                    <Input
                      value={nequiPhone}
                      onChange={(e) => setNequiPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="3001234567"
                      maxLength={10}
                      className="bg-white/50 backdrop-blur-sm border-white/20"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recibirás una notificación en tu app Nequi para aprobar el pago
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handlePayment}
                disabled={!canProceed}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:brightness-110 shadow-lg shadow-primary/30"
              >
                Pagar ${amount.toLocaleString('es-CO')}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-16 w-16 text-primary" />
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Procesando pago...</p>
              <p className="text-sm text-muted-foreground mt-2">Por favor espera un momento</p>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="rounded-full bg-success/10 p-6"
            >
              <Check className="h-16 w-16 text-success" />
            </motion.div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">¡Pago exitoso!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tu suscripción al plan {planName} está activa
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
