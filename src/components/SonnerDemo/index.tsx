"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function SonnerDemo() {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        onClick={() =>
          toast("Evento criado", {
            description: "Domingo, 03 de Dezembro, 2023 às 9:00",
            action: {
              label: "Desfazer",
              onClick: () => console.log("Desfazer"),
            },
          })
        }
      >
        Toast Padrão
      </Button>
      
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Operação realizada com sucesso!", {
            description: "Tudo funcionou perfeitamente.",
          })
        }
      >
        Toast de Sucesso
      </Button>
      
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Erro ao processar", {
            description: "Algo deu errado. Tente novamente.",
          })
        }
      >
        Toast de Erro
      </Button>
      
      <Button
        variant="outline"
        onClick={() =>
          toast.warning("Aviso importante", {
            description: "Preste atenção nesta informação.",
          })
        }
      >
        Toast de Aviso
      </Button>
      
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Informação", {
            description: "Esta é uma mensagem informativa.",
          })
        }
      >
        Toast de Info
      </Button>
    </div>
  )
}
