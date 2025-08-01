"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Crie ou Encontre um Grupo",
      description: "Crie um novo grupo para sua conta de streaming ou encontre grupos existentes com vagas disponíveis.",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM22 11L20 13L18 11M20 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      step: "02",
      title: "Convide ou Seja Convidado",
      description: "Use nosso sistema de convites seguro para adicionar membros confiáveis ao seu grupo.",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      step: "03",
      title: "Organize os Pagamentos",
      description: "Nossa plataforma calcula automaticamente quanto cada membro deve pagar baseado no plano escolhido.",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M1 10H23" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 14H8.01M12 14H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      step: "04",
      title: "Compartilhe e Economize",
      description: "Todos os membros recebem acesso à conta e começam a economizar imediatamente!",
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <section id="como-funciona" className="py-24 bg-gradient-to-b from-white to-purple-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Como Funciona?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Em apenas 4 passos simples, você já estará economizando nas suas contas de streaming favoritas.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-12 mb-20 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-6 mb-6">
                        <motion.div
                          className="text-purple-600 dark:text-purple-400"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          {step.icon}
                        </motion.div>
                        <div className="flex items-center gap-4">
                          <span className="text-6xl font-bold text-purple-600/20 dark:text-purple-400/20">
                            {step.step}
                          </span>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {step.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Connecting line for larger screens */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex justify-center mb-8">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    transition={{ duration: 0.8, delay: (index + 1) * 0.2 }}
                    viewport={{ once: true }}
                    className="w-1 h-12 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para começar a economizar?
            </h3>
            <p className="text-purple-100 mb-6">
              Junte-se a centenas de usuários que já estão economizando com o Love2Share!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
