import type { BiometryType } from '@capgo/capacitor-native-biometric';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

const SERVER_IDENTIFIER = 'com.ficouclaro.app';

export class BiometricService {
  /**
   * Verifica se o dispositivo possui hardware de biometria (Digital / Face ID / Iris) ativo e cadastrado
   */
  async checkAvailability(): Promise<{ isAvailable: boolean; biometryType?: BiometryType }> {
    try {
      if (typeof window === 'undefined') return { isAvailable: false };
      const result = await NativeBiometric.isAvailable();
      return {
        isAvailable: result.isAvailable,
        biometryType: result.biometryType,
      };
    } catch {
      return { isAvailable: false };
    }
  }

  /**
   * Dispara a janela nativa do sistema pedindo leitura de digital/face
   */
  async authenticate(reason = 'Confirme sua digital para continuar'): Promise<boolean> {
    try {
      await NativeBiometric.verifyIdentity({
        reason,
        title: 'Autenticação Biométrica',
        subtitle: 'Acesse o Ficou Claro com sua digital',
        description: 'Encoste o dedo no leitor de digital para entrar',
        useFallback: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Criptografa e armazena os dados de acesso no Keystore/Keychain seguro do sistema
   */
  async saveCredentials(username: string, password: string): Promise<void> {
    try {
      await NativeBiometric.setCredentials({
        username,
        password,
        server: SERVER_IDENTIFIER,
      });
      localStorage.setItem('biometric_enabled', 'true');
    } catch (err) {
      console.error('[BiometricService] Erro ao salvar credenciais:', err);
    }
  }

  /**
   * Recupera os dados criptografados salvos no Keystore
   */
  async getCredentials(): Promise<{ username?: string; password?: string } | null> {
    try {
      const credentials = await NativeBiometric.getCredentials({
        server: SERVER_IDENTIFIER,
      });
      if (credentials && credentials.username && credentials.password) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Remove as credenciais salvas no Keystore do dispositivo
   */
  async deleteCredentials(): Promise<void> {
    try {
      await NativeBiometric.deleteCredentials({
        server: SERVER_IDENTIFIER,
      });
      localStorage.removeItem('biometric_enabled');
    } catch (err) {
      console.error('[BiometricService] Erro ao remover credenciais:', err);
    }
  }

  /**
   * Verifica se a biometria já foi ativada pelo usuário no aplicativo
   */
  isBiometricsEnabled(): boolean {
    return localStorage.getItem('biometric_enabled') === 'true';
  }
}

export const biometricService = new BiometricService();
