// Codes d'erreur de @capawesome/capacitor-passkeys (ErrorCode). Les messages
// fournis par Android ou le navigateur sont en anglais et varient selon les
// versions : on n'affiche que ces traductions.
const MESSAGES_BY_CODE: Record<string, string> = {
  CANCELED: "Opération annulée.",
  NO_CREDENTIAL:
    "Aucune clé de sécurité de ce compte n'est disponible sur cet appareil. Utilisez un code d'authentification ou un code de secours.",
  NOT_SUPPORTED:
    "Cet appareil ne permet pas d'utiliser une clé de sécurité (Android 9 et Google Play Services requis). Utilisez un code d'authentification.",
  DOMAIN_NOT_ASSOCIATED:
    "Cette application n'est pas autorisée à utiliser les clés de GestSIS. Contactez le support.",
  GET_FAILED:
    "La vérification par clé de sécurité a échoué. Réessayez, ou utilisez un code d'authentification.",
};

export function translateWebauthnError(error: unknown): string {
  // Le plugin place le code dans `code` en natif, dans `data.code` sur le web.
  const err = error as { code?: string; data?: { code?: string } } | undefined;
  const code = err?.code ?? err?.data?.code ?? "";
  return MESSAGES_BY_CODE[code] ?? "Échec de la vérification par clé de sécurité.";
}
