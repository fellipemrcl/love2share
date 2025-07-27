"use client"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StreamingPriceInfo } from "@/components/StreamingPriceInfo"

const formSchema = z.object({
  streamingId: z.string().min(1, {
    message: "Selecione um serviço de streaming.",
  }),
  maxMembers: z.number().min(2, {
    message: "O grupo deve ter pelo menos 2 membros (incluindo você).",
  }),
})

type FormData = z.infer<typeof formSchema>

interface Streaming {
  id: string;
  name: string;
  platform: string;
  logoUrl?: string;
  monthlyPrice?: number;
  maxSimultaneousScreens: number;
  maxUsers: number;
  description?: string;
}

interface CreateGroupFormProps {
  onSubmit: (values: FormData) => void
  isSubmitting?: boolean
}

export function CreateGroupForm({ onSubmit, isSubmitting = false }: CreateGroupFormProps) {
  const { user } = useUser();
  const [streamings, setStreamings] = useState<Streaming[]>([]);
  const [loadingStreamings, setLoadingStreamings] = useState(true);
  const [selectedStreaming, setSelectedStreaming] = useState<Streaming | null>(null);
  const [generatedGroupName, setGeneratedGroupName] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      streamingId: "",
      maxMembers: 2,
    },
  })

  useEffect(() => {
    const fetchStreamings = async () => {
      try {
        const response = await fetch('/api/streamings');
        if (response.ok) {
          const data = await response.json();
          setStreamings(data.streamings);
        }
      } catch (error) {
        console.error("Erro ao carregar streamings:", error);
      } finally {
        setLoadingStreamings(false);
      }
    };

    fetchStreamings();
  }, []);

  const handleStreamingChange = (streamingId: string) => {
    const streaming = streamings.find(s => s.id === streamingId);
    if (streaming) {
      setSelectedStreaming(streaming);
      // Gerar o nome do grupo automaticamente usando o nome real do usuário
      const userName = user?.firstName || user?.username || "Usuário";
      const groupName = `Grupo de ${streaming.name} de ${userName}`;
      setGeneratedGroupName(groupName);
      
      // Ajustar o número de membros se exceder o limite do streaming
      if (form.getValues('maxMembers') > streaming.maxSimultaneousScreens) {
        form.setValue('maxMembers', streaming.maxSimultaneousScreens);
      }
    }
  };

  const handleSubmit = (values: FormData) => {
    // Enviar apenas o streamingId, o nome e descrição serão gerados na API
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="streamingId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço de Streaming</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value);
                handleStreamingChange(value);
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço de streaming" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingStreamings ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Carregando streamings...
                    </div>
                  ) : streamings.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhum streaming disponível
                    </div>
                  ) : (
                    streamings.map((streaming) => (
                      <SelectItem key={streaming.id} value={streaming.id}>
                        {streaming.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedStreaming && (
          <>
            <StreamingPriceInfo 
              monthlyPrice={selectedStreaming.monthlyPrice}
              maxSimultaneousScreens={selectedStreaming.maxSimultaneousScreens}
              maxUsers={selectedStreaming.maxUsers}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Nome do Grupo
              </label>
              <Input 
                value={generatedGroupName}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                O nome será gerado automaticamente como &quot;Grupo de {selectedStreaming.name} de [Seu Nome]&quot;
              </p>
            </div>

            <FormField
              control={form.control}
              name="maxMembers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantas vagas disponibilizar?</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o número total de membros" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: selectedStreaming.maxSimultaneousScreens - 1 }, (_, i) => {
                        const memberCount = i + 2; // Começa em 2 (você + 1 pessoa)
                        const availableSlots = memberCount - 1; // Vagas disponíveis (excluindo você)
                        return (
                          <SelectItem key={memberCount} value={memberCount.toString()}>
                            {availableSlots} vaga{availableSlots !== 1 ? 's' : ''} ({memberCount} membros total)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Você já conta como 1 membro. Selecione quantas vagas adicionais deseja disponibilizar.
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Máximo: {selectedStreaming.maxSimultaneousScreens} membros ({selectedStreaming.maxSimultaneousScreens} telas)
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <Button type="submit" disabled={isSubmitting || !selectedStreaming} className="w-full">
          {isSubmitting ? "Criando..." : "Criar Grupo"}
        </Button>
      </form>
    </Form>
  )
}
