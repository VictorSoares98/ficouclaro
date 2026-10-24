import {
  courseService,
  type ClassroomInviteDetails,
} from '@/modules/courses/services/course.service';

// Declaração de tipagem para a API experimental/padrão BarcodeDetector
interface BarcodeFormat {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorInstance {
  detect(image: ImageBitmapSource): Promise<BarcodeFormat[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats: string[] }): BarcodeDetectorInstance;
      getSupportedFormats?(): Promise<string[]>;
    };
  }
}

class QrScannerService {
  /**
   * Verifica se o navegador atual suporta a API nativa BarcodeDetector.
   */
  public hasBarcodeDetectorSupport(): boolean {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window;
  }

  /**
   * Extrai o código de convite de 8 caracteres a partir de uma URL ou texto bruto escaneado.
   * Suporta formatos:
   * - https://dominio.com/#/join/abcd1234
   * - https://dominio.com/join/abcd1234
   * - ficouclaro://join/abcd1234
   * - abcd1234
   */
  public extractInviteCode(rawText: string): string {
    if (!rawText) return '';
    const clean = rawText.trim();

    // Se contiver padrão de rota /join/CODIGO
    const joinMatch = clean.match(/\/join\/([a-zA-Z0-9]+)/i);
    if (joinMatch && joinMatch[1]) {
      return joinMatch[1].toLowerCase();
    }

    // Se contiver parâmetro ?join=CODIGO ou ?code=CODIGO
    const paramMatch = clean.match(/[?&](?:join|code)=([a-zA-Z0-9]+)/i);
    if (paramMatch && paramMatch[1]) {
      return paramMatch[1].toLowerCase();
    }

    // Caso seja apenas o código direto alfanumérico
    const directCode = clean.replace(/[^a-zA-Z0-9]/g, '');
    return directCode.toLowerCase();
  }

  /**
   * Valida semântica do código de convite contra o backend do Supabase.
   */
  public async verifyInviteCode(code: string): Promise<ClassroomInviteDetails | null> {
    const cleanCode = this.extractInviteCode(code);
    if (!cleanCode) return null;

    try {
      return await courseService.getCourseDetailsByInviteCode(cleanCode);
    } catch (err) {
      console.warn('[QrScannerService] Falha ao verificar convite no backend:', err);
      return null;
    }
  }

  /**
   * Detecta QR Code a partir de um arquivo de imagem (fallback para galeria/foto).
   */
  public async detectFromImageFile(file: File): Promise<string | null> {
    if (
      typeof window === 'undefined' ||
      !this.hasBarcodeDetectorSupport() ||
      !window.BarcodeDetector
    ) {
      throw new Error(
        'Leitura automática de imagem não suportada neste navegador. Utilize a câmera ou digite o código.',
      );
    }

    try {
      const imageBitmap = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await detector.detect(imageBitmap);

      if (barcodes && barcodes.length > 0 && barcodes[0]) {
        return barcodes[0].rawValue;
      }
      return null;
    } catch (err) {
      console.warn('[QrScannerService] Falha ao detectar QR em imagem:', err);
      return null;
    }
  }
}

export const qrScannerService = new QrScannerService();
