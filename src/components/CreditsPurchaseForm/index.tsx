"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Coins } from "lucide-react";
import { toast } from "sonner";

const purchaseSchema = z.object({
  amount: z.number().min(1, "Mínimo de R$ 1,00").max(1000, "Máximo de R$ 1.000,00"),
  customerName: z.string().min(1, "Nome é obrigatório"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  address: z.object({
    cep: z.string().min(8, "CEP deve ter 8 dígitos").max(9),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    street: z.string().min(1, "Rua é obrigatória"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().length(2, "Estado deve ter 2 caracteres"),
  }),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

const CREDIT_PACKAGES = [
  { amount: 5, price: 500, popular: false },
  { amount: 10, price: 1000, popular: true },
  { amount: 25, price: 2500, popular: false },
  { amount: 50, price: 5000, popular: false },
  { amount: 100, price: 10000, popular: false },
];

export function CreditsPurchaseForm() {
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number>(1000); // R$ 10,00 = 10 créditos
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      amount: 10,
    },
  });

  const watchedAmount = watch("amount");

  const onSubmit = async (data: PurchaseFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/payments/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          amount: data.amount * 100, // Converter para centavos
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar link de pagamento");
      }

      const result = await response.json();
      
      // Redirecionar para o pagamento
      window.location.href = result.paymentUrl;

    } catch (error) {
      console.error("Erro:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Comprar Créditos</h1>
        <p className="text-muted-foreground">
          Adicione créditos à sua conta para usar na plataforma
        </p>
      </div>

      {/* Pacotes Populares */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card
            key={pkg.amount}
            className={`cursor-pointer transition-all ${
              selectedPackage === pkg.price
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-primary/50"
            } ${pkg.popular ? "border-green-500" : ""}`}
            onClick={() => {
              setSelectedPackage(pkg.price);
              setValue("amount", pkg.amount);
            }}
          >
            <CardHeader className="text-center pb-2">
              {pkg.popular && (
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full w-fit mx-auto mb-2">
                  Popular
                </div>
              )}
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <Coins className="h-5 w-5" />
                {pkg.amount}
              </div>
              <div className="text-sm text-muted-foreground">créditos</div>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <div className="text-lg font-semibold">
                {formatCurrency(pkg.price / 100)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency((pkg.price / 100) / pkg.amount)} por crédito
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Detalhes da Compra
            </CardTitle>
            <CardDescription>
              Confirme a quantidade de créditos e seus dados para pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Quantidade de Créditos</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  max="1000"
                  {...register("amount", { valueAsNumber: true })}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setValue("amount", value);
                    setSelectedPackage(value * 100);
                  }}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Valor Total</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center font-medium">
                  {formatCurrency(watchedAmount || 0)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nome Completo</Label>
                <Input
                  id="customerName"
                  {...register("customerName")}
                  placeholder="Seu nome completo"
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">{errors.customerName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register("customerEmail")}
                  placeholder="seu@email.com"
                />
                {errors.customerEmail && (
                  <p className="text-sm text-red-500">{errors.customerEmail.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telefone</Label>
              <Input
                id="customerPhone"
                {...register("customerPhone")}
                placeholder="(11) 99999-9999"
              />
              {errors.customerPhone && (
                <p className="text-sm text-red-500">{errors.customerPhone.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Endereço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    {...register("address.cep")}
                    placeholder="00000-000"
                  />
                  {errors.address?.cep && (
                    <p className="text-sm text-red-500">{errors.address.cep.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    {...register("address.number")}
                    placeholder="123"
                  />
                  {errors.address?.number && (
                    <p className="text-sm text-red-500">{errors.address.number.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  {...register("address.street")}
                  placeholder="Nome da rua"
                />
                {errors.address?.street && (
                  <p className="text-sm text-red-500">{errors.address.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    {...register("address.neighborhood")}
                    placeholder="Nome do bairro"
                  />
                  {errors.address?.neighborhood && (
                    <p className="text-sm text-red-500">{errors.address.neighborhood.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    {...register("address.complement")}
                    placeholder="Apto, bloco, etc. (opcional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    {...register("address.city")}
                    placeholder="Nome da cidade"
                  />
                  {errors.address?.city && (
                    <p className="text-sm text-red-500">{errors.address.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Input
                    id="state"
                    {...register("address.state")}
                    placeholder="SP"
                    maxLength={2}
                  />
                  {errors.address?.state && (
                    <p className="text-sm text-red-500">{errors.address.state.message}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button type="submit" disabled={loading} size="lg" className="min-w-48">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar {formatCurrency(watchedAmount || 0)}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}