<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class SmsService
{
    private $twilio;
    private $verifyServiceSid;

    public function __construct()
    {
        $this->verifyServiceSid = config('services.twilio.verify_service_sid');

        $this->twilio = new Client(
            config('services.twilio.sid'),
            config('services.twilio.token')
        );
    }

    /**
     * Envia código de verificação via Twilio Verify
     */
    public function sendVerificationCode(string $phone, string $name = null): array
    {
        try {
            // Limpar e formatar telefone
            $cleanPhone = $this->formatPhoneNumber($phone);

            // Enviar verificação via Twilio Verify
            $verification = $this->twilio->verify->v2
                ->services($this->verifyServiceSid)
                ->verifications->create(
                    $cleanPhone,
                    'sms'
                );

            Log::info('Código de verificação enviado via Twilio Verify', [
                'phone' => $cleanPhone,
                'status' => $verification->status,
                'sid' => $verification->sid
            ]);

            return [
                'success' => true,
                'status' => $verification->status,
                'sid' => $verification->sid,
                'message' => 'Código de verificação enviado com sucesso'
            ];
        } catch (\Exception $e) {
            Log::error('Erro ao enviar código de verificação', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Erro ao enviar código de verificação: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Verifica código SMS via Twilio Verify
     */
    public function verifyCode(string $phone, string $code): array
    {
        try {
            // Limpar e formatar telefone
            $cleanPhone = $this->formatPhoneNumber($phone);

            // Verificar código via Twilio Verify
            $verificationCheck = $this->twilio->verify->v2
                ->services($this->verifyServiceSid)
                ->verificationChecks->create([
                    'to' => $cleanPhone,
                    'code' => $code,
                ]);

            $isValid = $verificationCheck->status === 'approved';

            Log::info('Verificação de código realizada', [
                'phone' => $cleanPhone,
                'status' => $verificationCheck->status,
                'valid' => $isValid,
                'sid' => $verificationCheck->sid
            ]);

            return [
                'success' => $isValid,
                'status' => $verificationCheck->status,
                'valid' => $isValid,
                'sid' => $verificationCheck->sid,
                'message' => $isValid ? 'Código verificado com sucesso' : 'Código inválido ou expirado'
            ];
        } catch (\Exception $e) {
            Log::error('Erro ao verificar código', [
                'phone' => $phone,
                'code' => $code,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Erro ao verificar código: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Formata número de telefone para o padrão internacional
     */
    private function formatPhoneNumber(string $phone): string
    {
        // Remove tudo que não é número
        $cleanPhone = preg_replace('/\D/', '', $phone);

        // Adicionar código do país se não tiver
        if (!str_starts_with($cleanPhone, '+55')) {
            $cleanPhone = '+55' . $cleanPhone;
        }

        return $cleanPhone;
    }

    /**
     * Verifica se o número de telefone é válido
     */
    public function isValidPhoneNumber(string $phone): bool
    {
        $cleanPhone = preg_replace('/\D/', '', $phone);

        // Verificar se tem pelo menos 10 dígitos (DDD + número)
        return strlen($cleanPhone) >= 10 && strlen($cleanPhone) <= 11;
    }

    /**
     * Gera um código SMS de 6 dígitos (fallback para casos especiais)
     */
    public function generateSmsCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
