"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StreamingPriceCalculator } from "@/components/StreamingPriceCalculator";

interface StreamingFormData {
  name: string;
  description: string;
  platform: string;
  logoUrl: string;
  websiteUrl: string;
  monthlyPrice: number | null;
  maxUsers: number;
  maxSimultaneousScreens: number;
}

interface CreateStreamingFormProps {
  onSubmit?: (data: StreamingFormData) => void;
  isSubmitting?: boolean;
}

export function CreateStreamingForm({ onSubmit, isSubmitting = false }: CreateStreamingFormProps) {
  const [formData, setFormData] = useState<StreamingFormData>({
    name: "",
    description: "",
    platform: "",
    logoUrl: "",
    websiteUrl: "",
    monthlyPrice: null,
    maxUsers: 1,
    maxSimultaneousScreens: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const updateField = <K extends keyof StreamingFormData>(
    field: K, 
    value: StreamingFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Criar Novo Streaming</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do serviço *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Ex: Netflix, Disney+, Prime Video"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Plataforma *</Label>
            <Input
              id="platform"
              value={formData.platform}
              onChange={(e) => updateField("platform", e.target.value)}
              placeholder="Ex: Netflix, Disney+"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("description", e.target.value)}
            placeholder="Descrição opcional do serviço de streaming"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL do Logo</Label>
            <Input
              id="logoUrl"
              type="url"
              value={formData.logoUrl}
              onChange={(e) => updateField("logoUrl", e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Site oficial</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => updateField("websiteUrl", e.target.value)}
              placeholder="https://exemplo.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxUsers">Máximo de usuários</Label>
          <Input
            id="maxUsers"
            type="number"
            min="1"
            value={formData.maxUsers}
            onChange={(e) => updateField("maxUsers", parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      {/* Calculadora de preço */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">Configuração de Preços</h3>
        <StreamingPriceCalculator
          initialMonthlyPrice={formData.monthlyPrice || undefined}
          initialMaxScreens={formData.maxSimultaneousScreens}
          onPriceChange={(price) => updateField("monthlyPrice", price)}
          onScreensChange={(screens) => updateField("maxSimultaneousScreens", screens)}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || !formData.name || !formData.platform}>
          {isSubmitting ? "Criando..." : "Criar Streaming"}
        </Button>
        <Button type="button" variant="outline">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
