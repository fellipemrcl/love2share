"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      avatar: "👩‍💼",
      role: "Estudante Universitária",
      content: "Consegui economizar mais de R$ 100 por mês compartilhando Netflix e Disney+ com meus amigos. O sistema é super seguro e fácil de usar!",
      rating: 5,
      savings: "R$ 120/mês"
    },
    {
      name: "João Santos",
      avatar: "👨‍💻",
      role: "Desenvolvedor",
      content: "Estava pagando todas as plataformas individualmente. Com o Love2Share, divido os custos com colegas de trabalho e ainda sobra dinheiro para o cinema!",
      rating: 5,
      savings: "R$ 95/mês"
    },
    {
      name: "Ana Costa",
      avatar: "👩‍🎓",
      role: "Designer",
      content: "O melhor é a organização automática dos pagamentos. Não preciso mais ficar cobrando todo mundo no WhatsApp. Tudo funciona perfeitamente!",
      rating: 5,
      savings: "R$ 85/mês"
    },
    {
      name: "Pedro Lima",
      avatar: "👨‍🏫",
      role: "Professor",
      content: "Criei um grupo familiar e agora todos em casa têm acesso às plataformas pagando muito menos. Recomendo para todo mundo!",
      rating: 5,
      savings: "R$ 150/mês"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            O que nossos usuários dizem
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Milhares de pessoas já estão economizando e se divertindo mais com o Love2Share.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="h-full"
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardContent className="p-6">
                  {/* Rating stars */}
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-center mb-6 text-muted-foreground italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>

                  {/* User info */}
                  <div className="text-center">
                    <div className="text-3xl mb-2">{testimonial.avatar}</div>
                    <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{testimonial.role}</p>
                    
                    {/* Savings badge */}
                    <motion.div
                      className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold"
                      whileHover={{ scale: 1.05 }}
                    >
                      💰 Economiza {testimonial.savings}
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to action for testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Você também pode fazer parte desta comunidade!
            </h3>
            <p className="text-muted-foreground mb-6">
              Junte-se a milhares de usuários satisfeitos e comece a economizar hoje mesmo.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Mais de 1.000 usuários ativos
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Avaliação 4.9/5 estrelas
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Economia média de R$ 112/mês
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
