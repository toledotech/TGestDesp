import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface UploadLogoProps {
  logoUrl?: string
  onLogoChange: (file: File) => void
  onLogoRemove: () => void
}

export const UploadLogo = ({ logoUrl, onLogoChange, onLogoRemove }: UploadLogoProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(logoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive"
      })
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive"
      })
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    onLogoChange(file)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onLogoRemove()
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative mx-auto w-32 h-32 rounded-lg overflow-hidden bg-muted">
                <img
                  src={previewUrl}
                  alt="Logo da empresa"
                  className="w-full h-full object-contain"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-center">
                <Button variant="outline" onClick={handleClick} className="mr-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Alterar Logo
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Logo da Empresa</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Adicione o logo da sua empresa (PNG, JPG - máx. 5MB)
              </p>
              <Button onClick={handleClick} className="bg-gradient-primary hover:opacity-90">
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}