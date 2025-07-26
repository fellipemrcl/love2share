"use client"

import { useState } from "react";
import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CreateGroupForm } from "../CreateGroupForm";

const MainClient = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGroup = async (values: { streamingId: string; maxMembers: number }) => {
    try {
      setIsSubmitting(true);
      console.log("Criando grupo:", values);
      
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        console.log("Grupo criado com sucesso!");
        setIsOpen(false); // Fechar o modal
        // Aqui você pode adicionar um toast de sucesso
      } else {
        const errorData = await response.json();
        console.error("Erro ao criar grupo:", errorData.error);
        // Aqui você pode adicionar um toast de erro
      }
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      // Aqui você pode adicionar um toast de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">+ Criar novo grupo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Compartilhar conta de streaming</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para criar um grupo e compartilhar sua conta de streaming.
          </DialogDescription>
        </DialogHeader>
        <CreateGroupForm onSubmit={handleCreateGroup} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
};

export default MainClient;
