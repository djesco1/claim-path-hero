import { PublicNavbar } from '@/components/layout';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="container max-w-3xl py-16">
        <h1 className="text-3xl font-bold text-foreground mb-8">Política de Privacidad</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Última actualización:</strong> 1 de enero de 2024</p>

          <h2 className="text-lg font-semibold text-foreground">1. Responsable del Tratamiento</h2>
          <p>ClaimPath, con domicilio en Bogotá D.C., Colombia, es responsable del tratamiento de los datos personales recopilados a través de la plataforma, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.</p>

          <h2 className="text-lg font-semibold text-foreground">2. Datos Recopilados</h2>
          <p>Recopilamos: nombre completo, correo electrónico, país de residencia, y la información que el usuario proporcione voluntariamente para la generación de documentos legales.</p>

          <h2 className="text-lg font-semibold text-foreground">3. Finalidad del Tratamiento</h2>
          <p>Los datos son utilizados para: (a) la prestación del servicio de generación de documentos; (b) la comunicación con el usuario sobre su cuenta y reclamaciones; (c) el mejoramiento continuo de la plataforma.</p>

          <h2 className="text-lg font-semibold text-foreground">4. Seguridad</h2>
          <p>Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger los datos personales contra acceso no autorizado, pérdida o alteración. Toda la información se transmite mediante cifrado TLS y se almacena en servidores seguros.</p>

          <h2 className="text-lg font-semibold text-foreground">5. Compartición con Terceros</h2>
          <p>No compartimos, vendemos ni transferimos datos personales a terceros, excepto cuando sea requerido por ley o por orden judicial.</p>

          <h2 className="text-lg font-semibold text-foreground">6. Derechos del Titular</h2>
          <p>Conforme a la legislación colombiana, usted tiene derecho a: conocer, actualizar, rectificar y suprimir sus datos personales; revocar la autorización otorgada; acceder de forma gratuita a sus datos; y presentar quejas ante la Superintendencia de Industria y Comercio.</p>

          <h2 className="text-lg font-semibold text-foreground">7. Retención de Datos</h2>
          <p>Los datos personales serán conservados durante el tiempo que el usuario mantenga su cuenta activa y por un período adicional de 5 años para cumplir con obligaciones legales.</p>

          <h2 className="text-lg font-semibold text-foreground">8. Cookies</h2>
          <p>Utilizamos cookies técnicas necesarias para el funcionamiento de la plataforma. No utilizamos cookies de seguimiento ni publicidad.</p>

          <h2 className="text-lg font-semibold text-foreground">9. Contacto</h2>
          <p>Para ejercer sus derechos o realizar consultas sobre esta política, escriba a contacto@claimpath.app</p>
        </div>
      </div>
    </div>
  );
}
