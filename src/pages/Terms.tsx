import { PublicNavbar } from '@/components/layout';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="container max-w-3xl py-16">
        <h1 className="text-3xl font-bold text-foreground mb-8">Términos y Condiciones</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Última actualización:</strong> 1 de enero de 2024</p>

          <h2 className="text-lg font-semibold text-foreground">1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar ClaimPath, usted acepta estos términos y condiciones en su totalidad. Si no está de acuerdo con alguno de estos términos, le rogamos no utilizar nuestros servicios.</p>

          <h2 className="text-lg font-semibold text-foreground">2. Descripción del Servicio</h2>
          <p>ClaimPath es una plataforma de asistencia documental que utiliza inteligencia artificial para generar documentos legales formales basados en la información proporcionada por el usuario. ClaimPath NO es un servicio de asesoría legal, NO reemplaza la consulta con un abogado y NO garantiza resultados específicos en procedimientos legales.</p>

          <h2 className="text-lg font-semibold text-foreground">3. Uso del Servicio</h2>
          <p>El usuario se compromete a proporcionar información veraz y precisa al utilizar la plataforma. Los documentos generados son orientativos y su efectividad depende de la veracidad de los hechos descritos y del contexto específico de cada caso.</p>

          <h2 className="text-lg font-semibold text-foreground">4. Limitación de Responsabilidad</h2>
          <p>ClaimPath no se hace responsable por los resultados obtenidos con los documentos generados. El usuario asume toda la responsabilidad por el uso que haga de los documentos y por la veracidad de la información proporcionada.</p>

          <h2 className="text-lg font-semibold text-foreground">5. Propiedad Intelectual</h2>
          <p>Los documentos generados por el usuario son de su propiedad. La plataforma, su código fuente, diseño y contenido son propiedad exclusiva de ClaimPath.</p>

          <h2 className="text-lg font-semibold text-foreground">6. Privacidad y Datos</h2>
          <p>El tratamiento de datos personales se rige por nuestra Política de Privacidad. La información proporcionada por los usuarios está cifrada y no es compartida con terceros.</p>

          <h2 className="text-lg font-semibold text-foreground">7. Planes y Pagos</h2>
          <p>ClaimPath ofrece un plan gratuito con funcionalidades limitadas y un plan Pro con funcionalidades ampliadas. Los precios y características de cada plan están detallados en la sección de precios de la plataforma.</p>

          <h2 className="text-lg font-semibold text-foreground">8. Legislación Aplicable</h2>
          <p>Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia será sometida a los tribunales competentes de Bogotá D.C.</p>

          <h2 className="text-lg font-semibold text-foreground">9. Contacto</h2>
          <p>Para cualquier consulta sobre estos términos, escriba a contacto@claimpath.app</p>
        </div>
      </div>
    </div>
  );
}
