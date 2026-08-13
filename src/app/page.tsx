import { Metadata } from 'next';
import Hero3D from './components/Hero3D';

export const metadata: Metadata = {
  title: "BMM Parts - Industrial Spareparts Specialist | Norgren, SMC, HIKRobot, Continental Indonesia",
  description: "Leading supplier of industrial spareparts in Indonesia. Norgren pneumatics, SMC automation, HIKRobot vision systems, Hikvision cameras, Continental & Contitech seal kits, VIBCO vibrators. Fast delivery, genuine products, expert support.",
  keywords: "norgren distributor indonesia, smc pneumatic indonesia, hikrobot indonesia, hikvision industrial, continental seal kit, contitech seal, vibco vibrator, industrial automation parts, pneumatic cylinder, hydraulic seal, o-ring, mechanical seal, parker seal, industrial camera, vision system, engineering spareparts jakarta",
};

export default function Home() {
  // FAQ JSON-LD for SEO
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where can I buy Norgren products in Indonesia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BMM Parts is an authorized distributor of Norgren pneumatic components in Indonesia. We offer genuine Norgren cylinders, valves, FRL units, and automation products with full warranty and technical support. Order online or contact us for quotations.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does BMM Parts sell SMC pneumatic components?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, BMM Parts is an authorized SMC distributor in Indonesia. We supply SMC pneumatic cylinders, solenoid valves, air preparation units, electric actuators, vacuum equipment, and complete automation solutions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where to find Continental and Contitech seal kits in Indonesia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BMM Parts provides genuine Continental and Contitech seal kits, O-rings, hydraulic seals, and pneumatic seals. We offer technical consultation to help you select the right seal for your application with fast delivery across Indonesia.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I buy HIKRobot and Hikvision industrial cameras from BMM Parts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we are an authorized distributor of HIKRobot and Hikvision industrial vision systems. We provide machine vision cameras, 3D vision systems, barcode readers, smart cameras, and complete vision inspection solutions with integration support.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where to buy VIBCO industrial vibrators in Indonesia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BMM Parts supplies VIBCO pneumatic vibrators, electric vibrators, turbine vibrators, and bin activators for material flow applications. We provide application engineering support to ensure you get the right vibrator for your needs.',
        },
      },
      {
        '@type': 'Question',
        name: 'What industrial spareparts brands does BMM Parts carry?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BMM Parts is an authorized distributor of premium industrial brands including Norgren, SMC, HIKRobot, Hikvision, Continental, Contitech, VIBCO, and many more. We provide genuine products for pneumatics, hydraulics, automation, sealing, and vision systems.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="bg-black">
        <Hero3D />
      </div>
    </>
  );
}
