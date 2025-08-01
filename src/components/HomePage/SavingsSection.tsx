"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const SavingsSection = () => {
  const platforms = [
    {
      name: "Netflix",
      originalPrice: "R$ 49,90",
      sharedPrice: "R$ 12,48",
      savings: "75%",
      maxScreens: 4,
      color: "from-red-500 to-red-600"
    },
    {
      name: "Disney+",
      originalPrice: "R$ 33,90",
      sharedPrice: "R$ 8,48",
      savings: "75%",
      maxScreens: 4,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Prime Video",
      originalPrice: "R$ 19,90",
      sharedPrice: "R$ 9,95",
      savings: "50%",
      maxScreens: 2,
      color: "from-orange-500 to-orange-600"
    },
    {
      name: "HBO Max",
      originalPrice: "R$ 34,90",
      sharedPrice: "R$ 11,63",
      savings: "67%",
      maxScreens: 3,
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Veja quanto você pode economizar
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Compare os preços individuais com os valores compartilhados e descubra sua economia mensal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${platform.color}`} />
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-4 group-hover:text-purple-600 transition-colors">
                      {platform.name}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Preço individual</p>
                        <p className="text-lg line-through text-red-500">{platform.originalPrice}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Compartilhando ({platform.maxScreens} telas)</p>
                        <p className="text-2xl font-bold text-green-600">{platform.sharedPrice}</p>
                      </div>
                      
                      <motion.div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${platform.color}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        -{platform.savings} economia
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Total savings calculation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-8 relative">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                  <circle cx="20" cy="20" r="15" fill="currentColor" />
                  <circle cx="80" cy="30" r="10" fill="currentColor" />
                  <circle cx="70" cy="80" r="12" fill="currentColor" />
                  <circle cx="30" cy="70" r="8" fill="currentColor" />
                </svg>
              </div>

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-bold mb-4">
                    💰 Economia Total Anual
                  </h3>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
                    <div>
                      <p className="text-purple-200 mb-2">Assinando individualmente</p>
                      <p className="text-4xl font-bold line-through text-red-300">R$ 1.662,00</p>
                    </div>
                    <div className="text-4xl">→</div>
                    <div>
                      <p className="text-purple-200 mb-2">Compartilhando no Love2Share</p>
                      <p className="text-4xl font-bold text-green-300">R$ 498,60</p>
                    </div>
                  </div>
                  <motion.div
                    className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-xl font-bold"
                    whileHover={{ scale: 1.05 }}
                  >
                    💸 Você economiza R$ 1.163,40 por ano!
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground max-w-2xl mx-auto">
            * Valores baseados nos planos premium de cada plataforma. A economia real pode variar dependendo do número de membros ativos em cada grupo.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SavingsSection;
