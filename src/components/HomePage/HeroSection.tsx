"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const HeroSection = () => {
  const { isSignedIn } = useUser();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white">
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 -left-4 w-72 h-72 bg-white/10 rounded-full blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 -right-4 w-96 h-96 bg-white/10 rounded-full blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Love2Share
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Compartilhe suas contas de streaming e economize até 80%
            </p>
            <p className="text-lg mb-12 text-purple-200 max-w-2xl mx-auto">
              Crie grupos seguros para dividir os custos da Netflix, Disney+, Prime Video e muito mais!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isSignedIn ? (
              <>
                <Link href="/groups/find">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg">
                    Encontrar Grupos
                  </Button>
                </Link>
                <Link href="/groups/my">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Meus Grupos
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <SignInButton>
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg">
                    Começar Agora
                  </Button>
                </SignInButton>
                <Link href="#como-funciona">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Como Funciona
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Streaming icons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 flex justify-center items-center gap-8 flex-wrap"
          >
            <div className="text-sm text-purple-200 mb-4 w-full">
              Compatível com as principais plataformas:
            </div>
            {["Netflix", "Disney+", "Prime Video", "HBO Max", "Spotify"].map((platform, index) => (
              <motion.div
                key={platform}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
              >
                {platform}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Arrow down */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </section>
  );
};

export default HeroSection;
