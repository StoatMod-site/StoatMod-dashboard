"use client";

import { useEffect, useSyncExternalStore } from "react";

export type AppLocale = "en" | "fr" | "pt" | "es";

export const APP_LANGUAGES: { code: AppLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
];

type Translation = { fr: string; pt: string; es: string };
const P: Record<string, Translation> = {
  "Aggregate activity": {fr:"Activité agrégée",pt:"Atividade agregada",es:"Actividad agregada"},
  "Daily community totals": {fr:"Totaux quotidiens de la communauté",pt:"Totais diários da comunidade",es:"Totales diarios de la comunidad"},
  "Statistics do not record individual activity, message text or popular words.": {fr:"Les statistiques n’enregistrent ni l’activité individuelle, ni le texte des messages, ni les mots populaires.",pt:"As estatísticas não registam atividade individual, texto de mensagens ou palavras populares.",es:"Las estadísticas no registran actividad individual, texto de mensajes ni palabras populares."},
  "Language": {fr:"Langue",pt:"Idioma",es:"Idioma"},
  "Choose language": {fr:"Choisir la langue",pt:"Escolher idioma",es:"Elegir idioma"},
  "JOIN / VERIFY": {fr:"REJOINDRE / VÉRIFIER",pt:"ENTRAR / VERIFICAR",es:"ENTRAR / VERIFICAR"},
  "Verification complete.": {fr:"Vérification terminée.",pt:"Verificação concluída.",es:"Verificación completada."},
  "The bot is removing your temporary restriction. You can safely close this page and return to Stoat.": {fr:"Le bot retire votre restriction temporaire. Vous pouvez fermer cette page et retourner sur Stoat.",pt:"O bot está a remover a sua restrição temporária. Pode fechar esta página e voltar ao Stoat.",es:"El bot está retirando tu restricción temporal. Puedes cerrar esta página y volver a Stoat."},
  "Secure member check": {fr:"Contrôle sécurisé du membre",pt:"Verificação segura de membro",es:"Comprobación segura del miembro"},
  "Preparing verification…": {fr:"Préparation de la vérification…",pt:"A preparar a verificação…",es:"Preparando la verificación…"},
  "Join": {fr:"Rejoindre",pt:"Entrar em",es:"Entrar en"},
  "This one-time check confirms you are using a real browser and screens the connection for VPN, proxy, Tor and known abusive-network signals.": {fr:"Ce contrôle unique confirme que vous utilisez un vrai navigateur et analyse la connexion pour détecter les VPN, proxys, Tor et les réseaux abusifs connus.",pt:"Esta verificação única confirma que está a usar um navegador real e analisa a ligação quanto a VPN, proxy, Tor e sinais conhecidos de redes abusivas.",es:"Esta comprobación única confirma que usas un navegador real y analiza la conexión en busca de VPN, proxy, Tor y señales conocidas de redes abusivas."},
  "Verification attempt": {fr:"Tentative de vérification",pt:"Tentativa de verificação",es:"Intento de verificación"},
  "attempt remaining": {fr:"tentative restante",pt:"tentativa restante",es:"intento restante"},
  "attempts remaining": {fr:"tentatives restantes",pt:"tentativas restantes",es:"intentos restantes"},
  "Reason:": {fr:"Raison :",pt:"Motivo:",es:"Motivo:"},
  "Browser CAPTCHA": {fr:"CAPTCHA du navigateur",pt:"CAPTCHA do navegador",es:"CAPTCHA del navegador"},
  "Ready": {fr:"Prêt",pt:"Pronto",es:"Listo"},
  "Not configured by the server owner": {fr:"Non configuré par le propriétaire du serveur",pt:"Não configurado pelo proprietário do servidor",es:"No configurado por el propietario del servidor"},
  "Network risk scan": {fr:"Analyse des risques réseau",pt:"Análise de risco da rede",es:"Análisis de riesgo de red"},
  "VPN, proxy, Tor and abuse detection ready": {fr:"Détection des VPN, proxys, Tor et abus prête",pt:"Deteção de VPN, proxy, Tor e abuso pronta",es:"Detección de VPN, proxy, Tor y abuso lista"},
  "One-time link": {fr:"Lien à usage unique",pt:"Link de utilização única",es:"Enlace de un solo uso"},
  "Expires": {fr:"Expire à",pt:"Expira às",es:"Caduca a las"},
  "Running checks…": {fr:"Contrôles en cours…",pt:"A executar verificações…",es:"Ejecutando comprobaciones…"},
  "Verify and enter server": {fr:"Vérifier et rejoindre le serveur",pt:"Verificar e entrar no servidor",es:"Verificar y entrar al servidor"},
  "This verification link is unavailable.": {fr:"Ce lien de vérification est indisponible.",pt:"Este link de verificação não está disponível.",es:"Este enlace de verificación no está disponible."},
  "Verification could not be opened.": {fr:"Impossible d’ouvrir la vérification.",pt:"Não foi possível abrir a verificação.",es:"No se pudo abrir la verificación."},
  "The browser CAPTCHA could not load. Refresh and try again.": {fr:"Le CAPTCHA du navigateur n’a pas pu se charger. Actualisez la page et réessayez.",pt:"Não foi possível carregar o CAPTCHA. Atualize e tente novamente.",es:"No se pudo cargar el CAPTCHA. Actualiza la página e inténtalo de nuevo."},
  "The browser CAPTCHA could not load.": {fr:"Le CAPTCHA du navigateur n’a pas pu se charger.",pt:"Não foi possível carregar o CAPTCHA.",es:"No se pudo cargar el CAPTCHA."},
  "Verification failed.": {fr:"Échec de la vérification.",pt:"A verificação falhou.",es:"La verificación falló."},
  "This verification link is missing or invalid.": {fr:"Ce lien de vérification est manquant ou invalide.",pt:"Este link de verificação está em falta ou é inválido.",es:"Este enlace de verificación falta o no es válido."},
  "The result is attached to this one-time server verification. Stoatmod does not expose your IP address to moderators.": {fr:"Le résultat est associé à cette vérification unique du serveur. Stoatmod ne révèle pas votre adresse IP aux modérateurs.",pt:"O resultado é associado a esta verificação única do servidor. O Stoatmod não expõe o seu endereço IP aos moderadores.",es:"El resultado se asocia a esta verificación única del servidor. Stoatmod no muestra tu dirección IP a los moderadores."},
  "Read the privacy policy.": {fr:"Lire la politique de confidentialité.",pt:"Ler a política de privacidade.",es:"Leer la política de privacidad."},

  "Independent case access": {fr:"Accès indépendant au dossier",pt:"Acesso independente ao caso",es:"Acceso independiente al caso"},
  "Appeal a moderation decision.": {fr:"Contester une décision de modération.",pt:"Recorrer de uma decisão de moderação.",es:"Apelar una decisión de moderación."},
  "Use the private code sent by Stoatmod and your Stoat user ID. Case evidence is never shown from a code alone.": {fr:"Utilisez le code privé envoyé par Stoatmod et votre identifiant Stoat. Les preuves du dossier ne sont jamais affichées avec le seul code.",pt:"Use o código privado enviado pelo Stoatmod e o seu ID de utilizador Stoat. As provas do caso nunca são mostradas apenas com o código.",es:"Usa el código privado enviado por Stoatmod y tu ID de usuario de Stoat. Las pruebas del caso nunca se muestran solo con el código."},
  "Appeal process": {fr:"Processus de recours",pt:"Processo de recurso",es:"Proceso de apelación"},
  "Verify": {fr:"Vérifier",pt:"Verificar",es:"Verificar"},
  "Open your private case": {fr:"Ouvrir votre dossier privé",pt:"Abrir o seu caso privado",es:"Abrir tu caso privado"},
  "Review": {fr:"Examiner",pt:"Rever",es:"Revisar"},
  "Read the stored evidence": {fr:"Lire les preuves enregistrées",pt:"Ler as provas armazenadas",es:"Leer las pruebas guardadas"},
  "Respond": {fr:"Répondre",pt:"Responder",es:"Responder"},
  "Submit your statement": {fr:"Envoyer votre déclaration",pt:"Enviar a sua declaração",es:"Enviar tu declaración"},
  "01 / Secure access": {fr:"01 / Accès sécurisé",pt:"01 / Acesso seguro",es:"01 / Acceso seguro"},
  "Open your case": {fr:"Ouvrir votre dossier",pt:"Abrir o seu caso",es:"Abrir tu caso"},
  "Both details must match before any moderation evidence is revealed.": {fr:"Les deux informations doivent correspondre avant que les preuves de modération soient révélées.",pt:"Os dois dados devem corresponder antes de qualquer prova de moderação ser revelada.",es:"Ambos datos deben coincidir antes de mostrar cualquier prueba de moderación."},
  "Appeal code": {fr:"Code de recours",pt:"Código de recurso",es:"Código de apelación"},
  "10-character code": {fr:"Code de 10 caractères",pt:"Código de 10 caracteres",es:"Código de 10 caracteres"},
  "Stoat user ID": {fr:"Identifiant utilisateur Stoat",pt:"ID de utilizador Stoat",es:"ID de usuario de Stoat"},
  "Your user ID": {fr:"Votre identifiant utilisateur",pt:"O seu ID de utilizador",es:"Tu ID de usuario"},
  "Checking…": {fr:"Vérification…",pt:"A verificar…",es:"Comprobando…"},
  "View case →": {fr:"Voir le dossier →",pt:"Ver caso →",es:"Ver caso →"},
  "Codes are case-specific. Stoatmod stores a hash of the code, not the code itself.": {fr:"Les codes sont propres à chaque dossier. Stoatmod conserve une empreinte du code, pas le code lui-même.",pt:"Os códigos são específicos de cada caso. O Stoatmod guarda um hash do código, não o próprio código.",es:"Los códigos son específicos de cada caso. Stoatmod guarda un hash del código, no el código en sí."},
  "Private evidence area": {fr:"Zone de preuves privée",pt:"Área privada de provas",es:"Área privada de pruebas"},
  "Your evidence will appear here.": {fr:"Vos preuves apparaîtront ici.",pt:"As suas provas aparecerão aqui.",es:"Tus pruebas aparecerán aquí."},
  "Warnings, eligible automated bans or timeouts, and global bans can be appealed. Your case stays private until both access details match.": {fr:"Les avertissements, bannissements ou exclusions temporaires automatiques admissibles et les bannissements globaux peuvent être contestés. Votre dossier reste privé jusqu’à ce que les deux informations d’accès correspondent.",pt:"Advertências, banimentos ou suspensões automáticos elegíveis e banimentos globais podem ser contestados. O seu caso permanece privado até os dois dados de acesso corresponderem.",es:"Se pueden apelar advertencias, bloqueos o suspensiones automáticas elegibles y bloqueos globales. Tu caso permanece privado hasta que coincidan ambos datos de acceso."},
  "Case": {fr:"Dossier",pt:"Caso",es:"Caso"},
  "Case ID": {fr:"ID du dossier",pt:"ID do caso",es:"ID del caso"},
  "Date": {fr:"Date",pt:"Data",es:"Fecha"},
  "Unavailable": {fr:"Indisponible",pt:"Indisponível",es:"No disponible"},
  "Moderator reason": {fr:"Raison du modérateur",pt:"Motivo do moderador",es:"Motivo del moderador"},
  "No reason supplied": {fr:"Aucune raison fournie",pt:"Nenhum motivo fornecido",es:"No se proporcionó ningún motivo"},
  "Original message": {fr:"Message d’origine",pt:"Mensagem original",es:"Mensaje original"},
  "Not stored for this action.": {fr:"Non conservé pour cette action.",pt:"Não armazenado para esta ação.",es:"No se guardó para esta acción."},
  "Detected thresholds": {fr:"Seuils détectés",pt:"Limites detetados",es:"Umbrales detectados"},
  "No automated threshold evidence applies to this case.": {fr:"Aucune preuve de seuil automatique ne s’applique à ce dossier.",pt:"Nenhuma prova de limite automático se aplica a este caso.",es:"No hay pruebas de umbral automático aplicables a este caso."},
  "Additional case evidence": {fr:"Preuves supplémentaires du dossier",pt:"Provas adicionais do caso",es:"Pruebas adicionales del caso"},
  "No additional evidence was added to this case.": {fr:"Aucune preuve supplémentaire n’a été ajoutée à ce dossier.",pt:"Não foram adicionadas provas adicionais a este caso.",es:"No se añadieron pruebas adicionales a este caso."},
  "Loading image…": {fr:"Chargement de l’image…",pt:"A carregar imagem…",es:"Cargando imagen…"},
  "Image unavailable": {fr:"Image indisponible",pt:"Imagem indisponível",es:"Imagen no disponible"},
  "Go to case": {fr:"Ouvrir le dossier",pt:"Ir para o caso",es:"Ir al caso"},
  "Case review": {fr:"Examen du dossier",pt:"Análise do caso",es:"Revisión del caso"},
  "Select a case": {fr:"Sélectionner un dossier",pt:"Selecionar um caso",es:"Seleccionar un caso"},
  "Opening case…": {fr:"Ouverture du dossier…",pt:"A abrir o caso…",es:"Abriendo el caso…"},
  "Choose a case from the compact list to review the decision, source evidence, confidence scores and investigation log.": {fr:"Choisissez un dossier dans la liste compacte pour examiner la décision, les preuves sources, les scores de confiance et le journal d’enquête.",pt:"Escolha um caso na lista compacta para analisar a decisão, as provas de origem, os níveis de confiança e o registo da investigação.",es:"Elige un caso de la lista compacta para revisar la decisión, las pruebas de origen, los niveles de confianza y el registro de investigación."},
  "Created": {fr:"Créé",pt:"Criado",es:"Creado"},
  "Decision basis": {fr:"Fondement de la décision",pt:"Fundamento da decisão",es:"Fundamento de la decisión"},
  "Source evidence": {fr:"Preuve source",pt:"Prova de origem",es:"Prueba de origen"},
  "No original message was stored for this action.": {fr:"Aucun message d’origine n’a été conservé pour cette action.",pt:"Não foi armazenada nenhuma mensagem original para esta ação.",es:"No se guardó ningún mensaje original para esta acción."},
  "Decision:": {fr:"Décision :",pt:"Decisão:",es:"Decisión:"},
  "The moderator did not add a public response.": {fr:"Le modérateur n’a pas ajouté de réponse publique.",pt:"O moderador não adicionou uma resposta pública.",es:"El moderador no añadió una respuesta pública."},
  "Your appeal": {fr:"Votre recours",pt:"O seu recurso",es:"Tu apelación"},
  "Explain what happened and why this decision should be reviewed.": {fr:"Expliquez ce qui s’est passé et pourquoi cette décision doit être réexaminée.",pt:"Explique o que aconteceu e por que esta decisão deve ser revista.",es:"Explica qué ocurrió y por qué debe revisarse esta decisión."},
  "Update appeal": {fr:"Mettre à jour le recours",pt:"Atualizar recurso",es:"Actualizar apelación"},
  "Submit appeal": {fr:"Envoyer le recours",pt:"Enviar recurso",es:"Enviar apelación"},
  "Could not find that appeal.": {fr:"Impossible de trouver ce recours.",pt:"Não foi possível encontrar esse recurso.",es:"No se pudo encontrar esa apelación."},
  "Could not submit the appeal.": {fr:"Impossible d’envoyer le recours.",pt:"Não foi possível enviar o recurso.",es:"No se pudo enviar la apelación."},
  "This verification link is invalid or expired.": {fr:"Ce lien de vérification est invalide ou expiré.",pt:"Este link de verificação é inválido ou expirou.",es:"Este enlace de verificación no es válido o ha caducado."},
  "Too many verification attempts. Try again later.": {fr:"Trop de tentatives de vérification. Réessayez plus tard.",pt:"Demasiadas tentativas de verificação. Tente novamente mais tarde.",es:"Demasiados intentos de verificación. Inténtalo de nuevo más tarde."},
  "Your browser could not be verified.": {fr:"Votre navigateur n’a pas pu être vérifié.",pt:"Não foi possível verificar o seu navegador.",es:"No se pudo verificar tu navegador."},
  "Browser CAPTCHA is not configured yet.": {fr:"Le CAPTCHA du navigateur n’est pas encore configuré.",pt:"O CAPTCHA do navegador ainda não está configurado.",es:"El CAPTCHA del navegador aún no está configurado."},
  "Browser CAPTCHA is temporarily unavailable. Try again later.": {fr:"Le CAPTCHA du navigateur est temporairement indisponible. Réessayez plus tard.",pt:"O CAPTCHA do navegador está temporariamente indisponível. Tente novamente mais tarde.",es:"El CAPTCHA del navegador no está disponible temporalmente. Inténtalo más tarde."},
  "Browser CAPTCHA was not completed successfully": {fr:"Le CAPTCHA du navigateur n’a pas été validé",pt:"O CAPTCHA do navegador não foi concluído com sucesso",es:"El CAPTCHA del navegador no se completó correctamente"},
  "The VPN scan is temporarily unavailable. Try again.": {fr:"L’analyse VPN est temporairement indisponible. Réessayez.",pt:"A análise de VPN está temporariamente indisponível. Tente novamente.",es:"El análisis de VPN no está disponible temporalmente. Inténtalo de nuevo."},
  "VPN scanning is not configured yet.": {fr:"L’analyse VPN n’est pas encore configurée.",pt:"A análise de VPN ainda não está configurada.",es:"El análisis de VPN aún no está configurado."},
  "Network risk scan was not accepted": {fr:"L’analyse des risques réseau n’a pas été acceptée",pt:"A análise de risco da rede não foi aceite",es:"No se aceptó el análisis de riesgo de red"},
  "Network risk detected:": {fr:"Risque réseau détecté :",pt:"Risco de rede detetado:",es:"Riesgo de red detectado:"},
  "user using TOR": {fr:"utilisateur utilisant TOR",pt:"utilizador a usar TOR",es:"usuario usando TOR"},
  "user using VPN": {fr:"utilisateur utilisant un VPN",pt:"utilizador a usar VPN",es:"usuario usando VPN"},
  "user using proxy": {fr:"utilisateur utilisant un proxy",pt:"utilizador a usar proxy",es:"usuario usando proxy"},
  "IP registered to Data Centre": {fr:"IP enregistrée auprès d’un centre de données",pt:"IP registado num centro de dados",es:"IP registrada en un centro de datos"},
  "IP registered as abusive": {fr:"IP enregistrée comme abusive",pt:"IP registado como abusivo",es:"IP registrada como abusiva"},
  "This verification link has already been used.": {fr:"Ce lien de vérification a déjà été utilisé.",pt:"Este link de verificação já foi utilizado.",es:"Este enlace de verificación ya se ha utilizado."},
  "Verification failed three times. You have been removed from the server.": {fr:"La vérification a échoué trois fois. Vous avez été retiré du serveur.",pt:"A verificação falhou três vezes. Foi removido do servidor.",es:"La verificación falló tres veces. Se te ha expulsado del servidor."},
  "Verification failed. Attempt": {fr:"Échec de la vérification. Tentative",pt:"A verificação falhou. Tentativa",es:"La verificación falló. Intento"},
  "Too many appeal attempts. Wait five minutes and try again.": {fr:"Trop de tentatives de recours. Attendez cinq minutes puis réessayez.",pt:"Demasiadas tentativas de recurso. Aguarde cinco minutos e tente novamente.",es:"Demasiados intentos de apelación. Espera cinco minutos e inténtalo de nuevo."},
  "Enter the ten-character appeal code sent by the bot.": {fr:"Saisissez le code de recours à dix caractères envoyé par le bot.",pt:"Introduza o código de recurso de dez caracteres enviado pelo bot.",es:"Introduce el código de apelación de diez caracteres enviado por el bot."},
  "Enter your Stoat user ID.": {fr:"Saisissez votre identifiant utilisateur Stoat.",pt:"Introduza o seu ID de utilizador Stoat.",es:"Introduce tu ID de usuario de Stoat."},
  "The appeal code and user ID do not match an eligible case.": {fr:"Le code de recours et l’identifiant utilisateur ne correspondent pas à un dossier admissible.",pt:"O código de recurso e o ID de utilizador não correspondem a um caso elegível.",es:"El código de apelación y el ID de usuario no coinciden con un caso apto."},
  "Your appeal must be between 20 and 2,000 characters.": {fr:"Votre recours doit comporter entre 20 et 2 000 caractères.",pt:"O seu recurso deve ter entre 20 e 2 000 caracteres.",es:"Tu apelación debe tener entre 20 y 2000 caracteres."},
  "This appeal has already been decided.": {fr:"Ce recours a déjà fait l’objet d’une décision.",pt:"Este recurso já foi decidido.",es:"Esta apelación ya se ha resuelto."},
  "This appeal could not be submitted.": {fr:"Ce recours n’a pas pu être envoyé.",pt:"Não foi possível enviar este recurso.",es:"No se pudo enviar esta apelación."},

  "Stoatmod home": {fr:"Accueil Stoatmod",pt:"Página inicial do Stoatmod",es:"Inicio de Stoatmod"},
  "Main navigation": {fr:"Navigation principale",pt:"Navegação principal",es:"Navegación principal"},
  "Home": {fr:"Accueil",pt:"Início",es:"Inicio"},
  "Features": {fr:"Fonctionnalités",pt:"Funcionalidades",es:"Funciones"},
  "Documentation": {fr:"Documentation",pt:"Documentação",es:"Documentación"},
  "Appeal": {fr:"Recours",pt:"Recurso",es:"Apelación"},
  "Status": {fr:"État",pt:"Estado",es:"Estado"},
  "Privacy": {fr:"Confidentialité",pt:"Privacidade",es:"Privacidad"},
  "Moderator login": {fr:"Connexion modérateur",pt:"Início de sessão de moderador",es:"Acceso de moderador"},

  "Overview": {fr:"Vue d’ensemble",pt:"Visão geral",es:"Resumen"},
  "Members": {fr:"Membres",pt:"Membros",es:"Miembros"},
  "Cases": {fr:"Dossiers",pt:"Casos",es:"Casos"},
  "Appeals": {fr:"Recours",pt:"Recursos",es:"Apelaciones"},
  "Activity": {fr:"Activité",pt:"Atividade",es:"Actividad"},
  "Automations": {fr:"Automatisations",pt:"Automações",es:"Automatizaciones"},
  "Polls": {fr:"Sondages",pt:"Sondagens",es:"Encuestas"},
  "Leaderboards": {fr:"Classements",pt:"Classificações",es:"Clasificaciones"},
  "Settings": {fr:"Paramètres",pt:"Definições",es:"Configuración"},
  "Support": {fr:"Assistance",pt:"Suporte",es:"Soporte"},
  "Control room": {fr:"Centre de contrôle",pt:"Sala de controlo",es:"Sala de control"},
  "Live · UTC": {fr:"En direct · UTC",pt:"Em direto · UTC",es:"En directo · UTC"},
  "Bot connected": {fr:"Bot connecté",pt:"Bot ligado",es:"Bot conectado"},
  "Sign out": {fr:"Se déconnecter",pt:"Terminar sessão",es:"Cerrar sesión"},
  "Messages today": {fr:"Messages aujourd’hui",pt:"Mensagens hoje",es:"Mensajes hoy"},
  "Active members": {fr:"Membres actifs",pt:"Membros ativos",es:"Miembros activos"},
  "New joins": {fr:"Nouvelles arrivées",pt:"Novas entradas",es:"Nuevas entradas"},
  "New leaves": {fr:"Nouveaux départs",pt:"Novas saídas",es:"Nuevas salidas"},
  "Community activity": {fr:"Activité de la communauté",pt:"Atividade da comunidade",es:"Actividad de la comunidad"},
  "Messages": {fr:"Messages",pt:"Mensagens",es:"Mensajes"},
  "Active users": {fr:"Utilisateurs actifs",pt:"Utilizadores ativos",es:"Usuarios activos"},
  "Total": {fr:"Total",pt:"Total",es:"Total"},
  "Daily average": {fr:"Moyenne quotidienne",pt:"Média diária",es:"Media diaria"},
  "Peak": {fr:"Pic",pt:"Pico",es:"Pico"},
  "Last 7 days": {fr:"7 derniers jours",pt:"Últimos 7 dias",es:"Últimos 7 días"},
  "Activity insights": {fr:"Aperçu de l’activité",pt:"Informações de atividade",es:"Información de actividad"},
  "Aggregate counts only · message text is not stored": {fr:"Comptages agrégés uniquement · le texte des messages n’est pas conservé",pt:"Apenas contagens agregadas · o texto das mensagens não é armazenado",es:"Solo recuentos agregados · el texto de los mensajes no se almacena"},
  "Active channels": {fr:"Salons actifs",pt:"Canais ativos",es:"Canales activos"},
  "Messages per member": {fr:"Messages par membre",pt:"Mensagens por membro",es:"Mensajes por miembro"},
  "Net member growth": {fr:"Croissance nette des membres",pt:"Crescimento líquido de membros",es:"Crecimiento neto de miembros"},
  "Most active channels": {fr:"Salons les plus actifs",pt:"Canais mais ativos",es:"Canales más activos"},
  "Most active words": {fr:"Mots les plus utilisés",pt:"Palavras mais usadas",es:"Palabras más usadas"},
  "Channel activity will appear after new messages.": {fr:"L’activité des salons apparaîtra après de nouveaux messages.",pt:"A atividade dos canais aparecerá após novas mensagens.",es:"La actividad de los canales aparecerá después de nuevos mensajes."},
  "Word trends will appear after new messages.": {fr:"Les tendances de mots apparaîtront après de nouveaux messages.",pt:"As tendências de palavras aparecerão após novas mensagens.",es:"Las tendencias de palabras aparecerán después de nuevos mensajes."},
  "Public visibility": {fr:"Visibilité publique",pt:"Visibilidade pública",es:"Visibilidad pública"},
  "Global statistics": {fr:"Statistiques globales",pt:"Estatísticas globais",es:"Estadísticas globales"},
  "Save visibility": {fr:"Enregistrer la visibilité",pt:"Guardar visibilidade",es:"Guardar visibilidad"},
  "Moderation queue": {fr:"File de modération",pt:"Fila de moderação",es:"Cola de moderación"},
  "Recent cases": {fr:"Dossiers récents",pt:"Casos recentes",es:"Casos recientes"},
  "View all →": {fr:"Tout afficher →",pt:"Ver tudo →",es:"Ver todo →"},
  "Protection status": {fr:"État de la protection",pt:"Estado da proteção",es:"Estado de la protección"},
  "Adjust protections": {fr:"Régler les protections",pt:"Ajustar proteções",es:"Ajustar protecciones"},
  "Automated protections": {fr:"Protections automatiques",pt:"Proteções automáticas",es:"Protecciones automáticas"},
  "Applies immediately": {fr:"Application immédiate",pt:"Aplicação imediata",es:"Aplicación inmediata"},
  "Join protection": {fr:"Protection des arrivées",pt:"Proteção de entrada",es:"Protección de entrada"},
  "CAPTCHA every member": {fr:"CAPTCHA pour chaque membre",pt:"CAPTCHA para todos os membros",es:"CAPTCHA para todos los miembros"},
  "Alt-account detection": {fr:"Détection des comptes alternatifs",pt:"Deteção de contas alternativas",es:"Detección de cuentas alternativas"},
  "Nickname protection": {fr:"Protection des surnoms",pt:"Proteção de alcunhas",es:"Protección de apodos"},
  "Link protection": {fr:"Protection des liens",pt:"Proteção de links",es:"Protección de enlaces"},
  "Link preferences": {fr:"Préférences des liens",pt:"Preferências de links",es:"Preferencias de enlaces"},
  "GIF links": {fr:"Liens GIF",pt:"Links GIF",es:"Enlaces GIF"},
  "Allow GIFs": {fr:"Autoriser les GIF",pt:"Permitir GIFs",es:"Permitir GIF"},
  "Off by default": {fr:"Désactivé par défaut",pt:"Desativado por predefinição",es:"Desactivado de forma predeterminada"},
  "Image scanning": {fr:"Analyse des images",pt:"Análise de imagens",es:"Análisis de imágenes"},
  "⚠ Experimental — may be inaccurate": {fr:"⚠ Expérimental — peut être inexact",pt:"⚠ Experimental — pode ser impreciso",es:"⚠ Experimental — puede ser impreciso"},
  "Moderator exemption": {fr:"Exemption des modérateurs",pt:"Isenção de moderadores",es:"Exención de moderadores"},
  "Exempt channels": {fr:"Salons exemptés",pt:"Canais isentos",es:"Canales exentos"},
  "Thresholds & logging": {fr:"Seuils et journalisation",pt:"Limites e registos",es:"Umbrales y registros"},
  "Moderation sensitivity": {fr:"Sensibilité de la modération",pt:"Sensibilidade da moderação",es:"Sensibilidad de la moderación"},
  "Required confidence": {fr:"Confiance requise",pt:"Confiança necessária",es:"Confianza necesaria"},
  "Required confidence to act": {fr:"Confiance requise pour intervenir",pt:"Confiança necessária para atuar",es:"Confianza necesaria para actuar"},
  "Act on more matches": {fr:"Intervenir sur davantage de correspondances",pt:"Atuar em mais correspondências",es:"Actuar sobre más coincidencias"},
  "Only high-confidence matches": {fr:"Uniquement les correspondances très fiables",pt:"Apenas correspondências de alta confiança",es:"Solo coincidencias de alta confianza"},
  "90% is the recommended minimum": {fr:"90 % est le minimum recommandé",pt:"90% é o mínimo recomendado",es:"El 90 % es el mínimo recomendado"},
  "Lower certainty increases false positives. Tiny background category scores can cause harmless messages to be deleted and innocent members to receive warnings.": {fr:"Une confiance plus faible augmente les faux positifs. De minuscules scores de catégorie en arrière-plan peuvent entraîner la suppression de messages inoffensifs et avertir des membres innocents.",pt:"Uma confiança mais baixa aumenta os falsos positivos. Pequenas pontuações de categoria em segundo plano podem eliminar mensagens inofensivas e advertir membros inocentes.",es:"Una confianza menor aumenta los falsos positivos. Las pequeñas puntuaciones de categoría en segundo plano pueden eliminar mensajes inofensivos y advertir a miembros inocentes."},
  "Stoatmod recommends a 90% threshold. Lower values increase false positives and can delete harmless messages or warn innocent members. Continue?": {fr:"Stoatmod recommande un seuil de 90 %. Des valeurs inférieures augmentent les faux positifs et peuvent supprimer des messages inoffensifs ou avertir des membres innocents. Continuer ?",pt:"O Stoatmod recomenda um limite de 90%. Valores inferiores aumentam os falsos positivos e podem eliminar mensagens inofensivas ou advertir membros inocentes. Continuar?",es:"Stoatmod recomienda un umbral del 90 %. Los valores inferiores aumentan los falsos positivos y pueden eliminar mensajes inofensivos o advertir a miembros inocentes. ¿Continuar?"},
  "Final confirmation: lower the required confidence to": {fr:"Confirmation finale : réduire la confiance requise à",pt:"Confirmação final: reduzir a confiança necessária para",es:"Confirmación final: reducir la confianza requerida al"},
  "Moderation log channel": {fr:"Salon du journal de modération",pt:"Canal de registo de moderação",es:"Canal del registro de moderación"},
  "Automatic roles for new members": {fr:"Rôles automatiques des nouveaux membres",pt:"Cargos automáticos para novos membros",es:"Roles automáticos para nuevos miembros"},
  "Save changes": {fr:"Enregistrer les modifications",pt:"Guardar alterações",es:"Guardar cambios"},
  "AI moderation scope": {fr:"Périmètre de modération par IA",pt:"Âmbito da moderação por IA",es:"Ámbito de moderación por IA"},
  "Included and excluded categories": {fr:"Catégories incluses et exclues",pt:"Categorias incluídas e excluídas",es:"Categorías incluidas y excluidas"},
  "Save category choices": {fr:"Enregistrer les catégories",pt:"Guardar categorias",es:"Guardar categorías"},
  "Bot preferences": {fr:"Préférences du bot",pt:"Preferências do bot",es:"Preferencias del bot"},
  "Server language": {fr:"Langue du serveur",pt:"Idioma do servidor",es:"Idioma del servidor"},
  "Stoatmod replies in": {fr:"Stoatmod répond en",pt:"O Stoatmod responde em",es:"Stoatmod responde en"},
  "Save language": {fr:"Enregistrer la langue",pt:"Guardar idioma",es:"Guardar idioma"},
  "Data lifecycle": {fr:"Cycle de vie des données",pt:"Ciclo de vida dos dados",es:"Ciclo de vida de los datos"},
  "Keep stored case data": {fr:"Conserver les dossiers enregistrés",pt:"Manter dados de casos armazenados",es:"Conservar los datos de casos guardados"},
  "Warning lifecycle": {fr:"Cycle de vie des avertissements",pt:"Ciclo de vida das advertências",es:"Ciclo de vida de las advertencias"},
  "Warning expiry": {fr:"Expiration des avertissements",pt:"Expiração das advertências",es:"Caducidad de las advertencias"},
  "Warnings count for": {fr:"Les avertissements comptent pendant",pt:"As advertências contam durante",es:"Las advertencias cuentan durante"},
  "Save warning expiry": {fr:"Enregistrer l’expiration",pt:"Guardar expiração",es:"Guardar caducidad"},
  "Saving…": {fr:"Enregistrement…",pt:"A guardar…",es:"Guardando…"},
  "Server members": {fr:"Membres du serveur",pt:"Membros do servidor",es:"Miembros del servidor"},
  "Search name or user ID": {fr:"Rechercher un nom ou un identifiant",pt:"Pesquisar nome ou ID",es:"Buscar nombre o ID"},
  "Moderation cases": {fr:"Dossiers de modération",pt:"Casos de moderação",es:"Casos de moderación"},
  "Appeal decisions": {fr:"Décisions de recours",pt:"Decisões de recursos",es:"Decisiones de apelaciones"},
  "DM me when someone appeals": {fr:"M’envoyer un message privé lorsqu’une personne fait appel",pt:"Enviar-me uma mensagem privada quando alguém recorrer",es:"Enviarme un mensaje privado cuando alguien apele"},
  "Receive a private Stoat message when a new moderation appeal is submitted in this server.": {fr:"Recevez un message Stoat privé lorsqu’un nouveau recours de modération est envoyé sur ce serveur.",pt:"Receba uma mensagem privada no Stoat quando for apresentado um novo recurso de moderação neste servidor.",es:"Recibe un mensaje privado de Stoat cuando se presente una nueva apelación de moderación en este servidor."},
  "Your appeal notification preference was saved.": {fr:"Votre préférence de notification des recours a été enregistrée.",pt:"A sua preferência de notificação de recursos foi guardada.",es:"Se guardó tu preferencia de notificación de apelaciones."},
  "Could not update your appeal notification preference.": {fr:"Impossible de mettre à jour votre préférence de notification des recours.",pt:"Não foi possível atualizar a sua preferência de notificação de recursos.",es:"No se pudo actualizar tu preferencia de notificación de apelaciones."},
  "Recent bot activity": {fr:"Activité récente du bot",pt:"Atividade recente do bot",es:"Actividad reciente del bot"},
  "Rankings": {fr:"Classements",pt:"Classificações",es:"Clasificaciones"},
  "Most active members": {fr:"Membres les plus actifs",pt:"Membros mais ativos",es:"Miembros más activos"},
  "Global server leaderboard": {fr:"Classement global des serveurs",pt:"Classificação global de servidores",es:"Clasificación global de servidores"},
  "Today": {fr:"Aujourd’hui",pt:"Hoje",es:"Hoy"},
  "This week": {fr:"Cette semaine",pt:"Esta semana",es:"Esta semana"},
  "This month": {fr:"Ce mois-ci",pt:"Este mês",es:"Este mes"},
  "Activity log": {fr:"Journal d’activité",pt:"Registo de atividade",es:"Registro de actividad"},
  "Protections": {fr:"Protections",pt:"Proteções",es:"Protecciones"},
  "Server safety": {fr:"Sécurité du serveur",pt:"Segurança do servidor",es:"Seguridad del servidor"},
  "Protection centre": {fr:"Centre de protection",pt:"Centro de proteção",es:"Centro de protección"},
  "Shape how Stoatmod verifies new members, reviews content and responds when something crosses the line.": {fr:"Définissez comment Stoatmod vérifie les nouveaux membres, analyse le contenu et intervient lorsqu’une limite est franchie.",pt:"Defina como o Stoatmod verifica novos membros, analisa conteúdos e responde quando algo ultrapassa os limites.",es:"Define cómo Stoatmod verifica a los nuevos miembros, revisa el contenido y responde cuando algo cruza los límites."},
  "Protection summary": {fr:"Résumé des protections",pt:"Resumo das proteções",es:"Resumen de protecciones"},
  "Core safeguards active": {fr:"Protections principales actives",pt:"Proteções principais ativas",es:"Protecciones principales activas"},
  "Response language": {fr:"Langue des réponses",pt:"Idioma das respostas",es:"Idioma de respuesta"},
  "Save all changes": {fr:"Enregistrer toutes les modifications",pt:"Guardar todas as alterações",es:"Guardar todos los cambios"},
  "Everything saved": {fr:"Tout est enregistré",pt:"Tudo guardado",es:"Todo guardado"},
  "Protection settings sections": {fr:"Sections des paramètres de protection",pt:"Secções das definições de proteção",es:"Secciones de configuración de protección"},
  "Safeguards": {fr:"Protections",pt:"Proteções",es:"Protecciones"},
  "Policy": {fr:"Politique",pt:"Política",es:"Política"},
  "AI scope": {fr:"Périmètre IA",pt:"Âmbito da IA",es:"Ámbito de IA"},
  "Exceptions": {fr:"Exceptions",pt:"Exceções",es:"Excepciones"},
  "Preferences": {fr:"Préférences",pt:"Preferências",es:"Preferencias"},
  "Access": {fr:"Accès",pt:"Acesso",es:"Acceso"},
  "Live safeguards": {fr:"Protections actives",pt:"Proteções ativas",es:"Protecciones activas"},
  "Choose what Stoatmod watches": {fr:"Choisissez ce que Stoatmod surveille",pt:"Escolha o que o Stoatmod monitoriza",es:"Elige lo que vigila Stoatmod"},
  "Switch individual checks on or off without changing the rest of your moderation policy.": {fr:"Activez ou désactivez chaque contrôle sans modifier le reste de votre politique de modération.",pt:"Ative ou desative cada verificação sem alterar o resto da política de moderação.",es:"Activa o desactiva cada comprobación sin cambiar el resto de la política de moderación."},
  "Response policy": {fr:"Politique d’intervention",pt:"Política de resposta",es:"Política de respuesta"},
  "Set the intervention level": {fr:"Définissez le niveau d’intervention",pt:"Defina o nível de intervenção",es:"Define el nivel de intervención"},
  "Tune confidence, logging, automatic roles and the actions applied as warnings accumulate.": {fr:"Réglez la confiance, la journalisation, les rôles automatiques et les actions appliquées à mesure que les avertissements s’accumulent.",pt:"Ajuste a confiança, os registos, os cargos automáticos e as ações aplicadas à medida que as advertências se acumulam.",es:"Ajusta la confianza, el registro, los roles automáticos y las acciones aplicadas al acumularse las advertencias."},
  "More permissive": {fr:"Plus permissif",pt:"Mais permissivo",es:"Más permisivo"},
  "More strict": {fr:"Plus strict",pt:"Mais rigoroso",es:"Más estricto"},
  "Moderation decisions and operational notices are sent here.": {fr:"Les décisions de modération et les alertes opérationnelles sont envoyées ici.",pt:"As decisões de moderação e os avisos operacionais são enviados para aqui.",es:"Las decisiones de moderación y los avisos operativos se envían aquí."},
  "Assign trusted starter roles after a member joins.": {fr:"Attribuez des rôles initiaux de confiance après l’arrivée d’un membre.",pt:"Atribua cargos iniciais de confiança depois de um membro entrar.",es:"Asigna roles iniciales de confianza después de que entre un miembro."},
  "Decide which risks count": {fr:"Décidez quels risques comptent",pt:"Decida quais riscos contam",es:"Decide qué riesgos cuentan"},
  "Included categories can trigger moderation above your sensitivity threshold. Self-harm protections always remain active.": {fr:"Les catégories incluses peuvent déclencher une modération au-dessus de votre seuil de sensibilité. Les protections contre l’automutilation restent toujours actives.",pt:"As categorias incluídas podem acionar a moderação acima do limite de sensibilidade. As proteções contra automutilação permanecem sempre ativas.",es:"Las categorías incluidas pueden activar la moderación por encima del umbral de sensibilidad. Las protecciones contra las autolesiones permanecen siempre activas."},
  "Included categories can trigger moderation when a match reaches the required confidence. Self-harm protections always remain active.": {fr:"Les catégories incluses peuvent déclencher une modération lorsqu’une correspondance atteint le niveau de confiance requis. Les protections contre l’automutilation restent toujours actives.",pt:"As categorias incluídas podem acionar a moderação quando uma correspondência atinge a confiança necessária. As proteções contra automutilação permanecem sempre ativas.",es:"Las categorías incluidas pueden activar la moderación cuando una coincidencia alcanza la confianza necesaria. Las protecciones contra las autolesiones permanecen siempre activas."},
  "Keep trusted spaces out of scope": {fr:"Excluez les espaces de confiance",pt:"Mantenha os espaços de confiança fora do âmbito",es:"Deja fuera los espacios de confianza"},
  "Exempt a whole category or individual channel from automatic moderation.": {fr:"Exemptez une catégorie entière ou un salon particulier de la modération automatique.",pt:"Isole uma categoria inteira ou um canal específico da moderação automática.",es:"Excluye una categoría completa o un canal concreto de la moderación automática."},
  "Server preferences": {fr:"Préférences du serveur",pt:"Preferências do servidor",es:"Preferencias del servidor"},
  "Language, warning expiry and visibility": {fr:"Langue, expiration des avertissements et visibilité",pt:"Idioma, expiração dos avisos e visibilidade",es:"Idioma, caducidad de advertencias y visibilidad"},
  "Keep operational choices together without changing how individual safeguards behave.": {fr:"Regroupez les choix opérationnels sans modifier le comportement de chaque protection.",pt:"Mantenha as opções operacionais reunidas sem alterar o funcionamento de cada proteção.",es:"Mantén juntas las opciones operativas sin cambiar el funcionamiento de cada protección."},
  "Controls the language Stoatmod uses for this server.": {fr:"Définit la langue utilisée par Stoatmod pour ce serveur.",pt:"Controla o idioma que o Stoatmod usa neste servidor.",es:"Controla el idioma que Stoatmod usa en este servidor."},
  "Control dashboard access": {fr:"Contrôlez l’accès au tableau de bord",pt:"Controle o acesso ao painel",es:"Controla el acceso al panel"},
  "Manage who can enter this server dashboard. Owner revocations override the Manage Server permission.": {fr:"Gérez les personnes autorisées à accéder au tableau de bord de ce serveur. Les révocations du propriétaire prévalent sur la permission Gérer le serveur.",pt:"Gira quem pode entrar no painel deste servidor. As revogações do proprietário prevalecem sobre a permissão Gerir servidor.",es:"Gestiona quién puede entrar al panel de este servidor. Las revocaciones del propietario prevalecen sobre el permiso Gestionar servidor."},
  "Unsaved protection changes": {fr:"Modifications de protection non enregistrées",pt:"Alterações de proteção por guardar",es:"Cambios de protección sin guardar"},
  "Protection settings are up to date": {fr:"Les paramètres de protection sont à jour",pt:"As definições de proteção estão atualizadas",es:"La configuración de protección está actualizada"},
  "Review your choices, then save once to apply everything.": {fr:"Vérifiez vos choix, puis enregistrez une seule fois pour tout appliquer.",pt:"Reveja as suas escolhas e guarde uma vez para aplicar tudo.",es:"Revisa tus opciones y guarda una vez para aplicarlo todo."},
  "Stoatmod is using the settings shown above.": {fr:"Stoatmod utilise les paramètres affichés ci-dessus.",pt:"O Stoatmod está a usar as definições apresentadas acima.",es:"Stoatmod está usando la configuración mostrada arriba."},
  "Member intelligence": {fr:"Informations sur les membres",pt:"Informações de membros",es:"Información de miembros"},
  "Profile viewer": {fr:"Profil du membre",pt:"Perfil do membro",es:"Perfil del miembro"},
  "Select a member": {fr:"Sélectionner un membre",pt:"Selecionar um membro",es:"Seleccionar un miembro"},
  "Open a profile to inspect join information, roles, warning totals, moderation history, avatar and banner.": {fr:"Ouvrez un profil pour consulter les informations d’arrivée, les rôles, les avertissements, l’historique de modération, l’avatar et la bannière.",pt:"Abra um perfil para consultar informações de entrada, cargos, advertências, histórico de moderação, avatar e banner.",es:"Abre un perfil para consultar la información de entrada, roles, advertencias, historial de moderación, avatar y banner."},
  "No matching members.": {fr:"Aucun membre correspondant.",pt:"Nenhum membro correspondente.",es:"No hay miembros coincidentes."},
  "Loading member snapshot…": {fr:"Chargement des membres…",pt:"A carregar membros…",es:"Cargando miembros…"},
  "Add role": {fr:"Ajouter un rôle",pt:"Adicionar cargo",es:"Añadir rol"},
  "Paste a Stoat role ID": {fr:"Collez un ID de rôle Stoat",pt:"Cole um ID de cargo Stoat",es:"Pega un ID de rol de Stoat"},
  "No automatic roles configured.": {fr:"Aucun rôle automatique configuré.",pt:"Nenhum cargo automático configurado.",es:"No hay roles automáticos configurados."},
  "Never expires (default)": {fr:"N’expire jamais (par défaut)",pt:"Nunca expira (predefinição)",es:"Nunca caduca (predeterminado)"},
  "Never expire (default)": {fr:"N’expirent jamais (par défaut)",pt:"Nunca expiram (predefinição)",es:"Nunca caducan (predeterminado)"},
  "Expired warnings remain visible but no longer count toward automatic penalties.": {fr:"Les avertissements expirés restent visibles mais ne comptent plus pour les sanctions automatiques.",pt:"As advertências expiradas permanecem visíveis, mas deixam de contar para penalizações automáticas.",es:"Las advertencias caducadas siguen visibles, pero ya no cuentan para las sanciones automáticas."},
  "Create automation": {fr:"Créer une automatisation",pt:"Criar automação",es:"Crear automatización"},
  "Dashboard only": {fr:"Tableau de bord uniquement",pt:"Apenas no painel",es:"Solo en el panel"},
  "Name": {fr:"Nom",pt:"Nome",es:"Nombre"},
  "Keyword is said": {fr:"Un mot-clé est utilisé",pt:"Uma palavra-chave é dita",es:"Se dice una palabra clave"},
  "Any message is sent": {fr:"Un message est envoyé",pt:"Qualquer mensagem é enviada",es:"Se envía cualquier mensaje"},
  "Message contains a link": {fr:"Le message contient un lien",pt:"A mensagem contém um link",es:"El mensaje contiene un enlace"},
  "Message has an attachment": {fr:"Le message contient une pièce jointe",pt:"A mensagem tem um anexo",es:"El mensaje tiene un archivo adjunto"},
  "Delete message": {fr:"Supprimer le message",pt:"Eliminar mensagem",es:"Eliminar mensaje"},
  "Warn member": {fr:"Avertir le membre",pt:"Advertir membro",es:"Advertir al miembro"},
  "Timeout member": {fr:"Exclure temporairement le membre",pt:"Suspender membro",es:"Suspender al miembro"},
  "Send reply": {fr:"Envoyer une réponse",pt:"Enviar resposta",es:"Enviar respuesta"},
  "Send moderation log": {fr:"Envoyer au journal de modération",pt:"Enviar registo de moderação",es:"Enviar registro de moderación"},
  "Duration (minutes)": {fr:"Durée (minutes)",pt:"Duração (minutos)",es:"Duración (minutos)"},
  "Additional conditions": {fr:"Conditions supplémentaires",pt:"Condições adicionais",es:"Condiciones adicionales"},
  "ALL conditions": {fr:"TOUTES les conditions",pt:"TODAS as condições",es:"TODAS las condiciones"},
  "ANY condition": {fr:"UNE condition",pt:"QUALQUER condição",es:"CUALQUIER condición"},
  "Username contains": {fr:"Le nom d’utilisateur contient",pt:"O nome de utilizador contém",es:"El nombre de usuario contiene"},
  "Username equals": {fr:"Le nom d’utilisateur est égal à",pt:"O nome de utilizador é igual a",es:"El nombre de usuario es igual a"},
  "Nickname contains": {fr:"Le surnom contient",pt:"A alcunha contém",es:"El apodo contiene"},
  "Nickname equals": {fr:"Le surnom est égal à",pt:"A alcunha é igual a",es:"El apodo es igual a"},
  "Channel is": {fr:"Le salon est",pt:"O canal é",es:"El canal es"},
  "Member has role": {fr:"Le membre possède le rôle",pt:"O membro tem o cargo",es:"El miembro tiene el rol"},
  "Message contains": {fr:"Le message contient",pt:"A mensagem contém",es:"El mensaje contiene"},
  "Message starts with": {fr:"Le message commence par",pt:"A mensagem começa por",es:"El mensaje empieza por"},
  "Message ends with": {fr:"Le message se termine par",pt:"A mensagem termina em",es:"El mensaje termina en"},
  "Message length at least": {fr:"Longueur minimale du message",pt:"Comprimento mínimo da mensagem",es:"Longitud mínima del mensaje"},
  "Message length at most": {fr:"Longueur maximale du message",pt:"Comprimento máximo da mensagem",es:"Longitud máxima del mensaje"},
  "Mentions at least": {fr:"Nombre minimal de mentions",pt:"Menções mínimas",es:"Menciones mínimas"},
  "Account age at most (days)": {fr:"Âge maximal du compte (jours)",pt:"Idade máxima da conta (dias)",es:"Antigüedad máxima de la cuenta (días)"},
  "Message has embed": {fr:"Le message contient une intégration",pt:"A mensagem tem conteúdo incorporado",es:"El mensaje tiene contenido insertado"},
  "Choose channel": {fr:"Choisir un salon",pt:"Escolher canal",es:"Elegir canal"},
  "Choose role": {fr:"Choisir un rôle",pt:"Escolher cargo",es:"Elegir rol"},
  "Add condition": {fr:"Ajouter une condition",pt:"Adicionar condição",es:"Añadir condición"},
  "Active recipes": {fr:"Recettes actives",pt:"Receitas ativas",es:"Recetas activas"},
  "No automations configured.": {fr:"Aucune automatisation configurée.",pt:"Nenhuma automação configurada.",es:"No hay automatizaciones configuradas."},
  "Create poll": {fr:"Créer un sondage",pt:"Criar sondagem",es:"Crear encuesta"},
  "Dashboard-only polls": {fr:"Sondages du tableau de bord",pt:"Sondagens exclusivas do painel",es:"Encuestas exclusivas del panel"},
  "Channel": {fr:"Salon",pt:"Canal",es:"Canal"},
  "Question": {fr:"Question",pt:"Pergunta",es:"Pregunta"},
  "Add option": {fr:"Ajouter une option",pt:"Adicionar opção",es:"Añadir opción"},
  "Allow multiple choices": {fr:"Autoriser plusieurs choix",pt:"Permitir várias escolhas",es:"Permitir varias opciones"},
  "Post at (optional)": {fr:"Publier à (facultatif)",pt:"Publicar em (opcional)",es:"Publicar el (opcional)"},
  "Close at (optional)": {fr:"Clôturer à (facultatif)",pt:"Fechar em (opcional)",es:"Cerrar el (opcional)"},
  "Schedule poll": {fr:"Programmer le sondage",pt:"Agendar sondagem",es:"Programar encuesta"},
  "Post poll": {fr:"Publier le sondage",pt:"Publicar sondagem",es:"Publicar encuesta"},
  "Recent polls": {fr:"Sondages récents",pt:"Sondagens recentes",es:"Encuestas recientes"},
  "Live results": {fr:"Résultats en direct",pt:"Resultados em direto",es:"Resultados en directo"},
  "Multiple choice": {fr:"Choix multiple",pt:"Escolha múltipla",es:"Opción múltiple"},
  "One choice": {fr:"Un seul choix",pt:"Uma escolha",es:"Una opción"},
  "No polls have been created.": {fr:"Aucun sondage n’a été créé.",pt:"Nenhuma sondagem foi criada.",es:"No se ha creado ninguna encuesta."},
  "Delete poll": {fr:"Supprimer le sondage",pt:"Eliminar sondagem",es:"Eliminar encuesta"},
  "Deleting…": {fr:"Suppression…",pt:"A eliminar…",es:"Eliminando…"},
  "Poll deleted.": {fr:"Sondage supprimé.",pt:"Sondagem eliminada.",es:"Encuesta eliminada."},
  "Could not delete poll.": {fr:"Impossible de supprimer le sondage.",pt:"Não foi possível eliminar a sondagem.",es:"No se pudo eliminar la encuesta."},
  "Poll not found.": {fr:"Sondage introuvable.",pt:"Sondagem não encontrada.",es:"Encuesta no encontrada."},
  "This will also remove its message from Stoat.": {fr:"Son message sera également supprimé de Stoat.",pt:"A respetiva mensagem também será removida do Stoat.",es:"También se eliminará su mensaje de Stoat."},
  "Most active servers": {fr:"Serveurs les plus actifs",pt:"Servidores mais ativos",es:"Servidores más activos"},
  "Most members": {fr:"Plus grand nombre de membres",pt:"Mais membros",es:"Más miembros"},
  "No ranking data is available for this filter.": {fr:"Aucune donnée de classement n’est disponible pour ce filtre.",pt:"Não há dados de classificação disponíveis para este filtro.",es:"No hay datos de clasificación para este filtro."},
  "Adjustable penalty ladder": {fr:"Échelle de sanctions réglable",pt:"Escala de penalizações ajustável",es:"Escala de sanciones ajustable"},
  "Add up to twelve stages. Each stage runs once when its warning threshold is reached.": {fr:"Ajoutez jusqu’à douze étapes. Chaque étape s’exécute une fois lorsque son seuil d’avertissements est atteint.",pt:"Adicione até doze etapas. Cada etapa é executada uma vez quando o limite de advertências é atingido.",es:"Añade hasta doce etapas. Cada etapa se ejecuta una vez al alcanzar su umbral de advertencias."},
  "Warnings": {fr:"Avertissements",pt:"Advertências",es:"Advertencias"},
  "Action": {fr:"Action",pt:"Ação",es:"Acción"},
  "Timeout": {fr:"Exclusion temporaire",pt:"Suspensão",es:"Suspensión"},
  "Kick": {fr:"Expulser",pt:"Expulsar",es:"Expulsar"},
  "Ban": {fr:"Bannir",pt:"Banir",es:"Bloquear"},
  "Minutes": {fr:"Minutes",pt:"Minutos",es:"Minutos"},
  "Remove": {fr:"Supprimer",pt:"Remover",es:"Eliminar"},
  "Add penalty stage": {fr:"Ajouter une étape de sanction",pt:"Adicionar etapa de penalização",es:"Añadir etapa de sanción"},
  "Submitted appeals": {fr:"Recours envoyés",pt:"Recursos enviados",es:"Apelaciones enviadas"},
  "No appeal codes have been generated yet.": {fr:"Aucun code de recours n’a encore été généré.",pt:"Ainda não foram gerados códigos de recurso.",es:"Todavía no se han generado códigos de apelación."},
  "The member has not submitted an appeal statement.": {fr:"Le membre n’a pas encore envoyé de déclaration de recours.",pt:"O membro ainda não enviou uma declaração de recurso.",es:"El miembro aún no ha enviado una declaración de apelación."},
  "Accept": {fr:"Accepter",pt:"Aceitar",es:"Aceptar"},
  "Deny": {fr:"Refuser",pt:"Recusar",es:"Denegar"},
  "Notes & evidence": {fr:"Notes et preuves",pt:"Notas e provas",es:"Notas y pruebas"},
  "Moderator note": {fr:"Note du modérateur",pt:"Nota do moderador",es:"Nota del moderador"},
  "Evidence": {fr:"Preuve",pt:"Prova",es:"Prueba"},
  "No notes or evidence added yet.": {fr:"Aucune note ou preuve ajoutée.",pt:"Ainda não foram adicionadas notas ou provas.",es:"Todavía no se han añadido notas ni pruebas."},
  "Need a hand?": {fr:"Besoin d’aide ?",pt:"Precisa de ajuda?",es:"¿Necesitas ayuda?"},
  "Email support": {fr:"Contacter l’assistance",pt:"Contactar suporte",es:"Contactar con soporte"},
  "Open documentation →": {fr:"Ouvrir la documentation →",pt:"Abrir documentação →",es:"Abrir documentación →"},
  "On": {fr:"Activé",pt:"Ativado",es:"Activado"},
  "Off": {fr:"Désactivé",pt:"Desativado",es:"Desactivado"},
  "This controls the language Stoatmod uses for this server. You can also use": {fr:"Ceci définit la langue utilisée par Stoatmod sur ce serveur. Vous pouvez aussi utiliser",pt:"Isto define o idioma que o Stoatmod usa neste servidor. Também pode usar",es:"Esto define el idioma que Stoatmod usa en este servidor. También puedes usar"},
  "Setup attention required": {fr:"Configuration requise",pt:"Configuração necessária",es:"Configuración necesaria"},
  "Permission status unavailable": {fr:"État des autorisations indisponible",pt:"Estado das permissões indisponível",es:"Estado de permisos no disponible"},
  "Channel or logging permission issue detected": {fr:"Problème d’autorisation de salon ou de journal détecté",pt:"Detetado problema de permissão de canal ou registo",es:"Se ha detectado un problema de permisos de canal o registro"},
  "Stoatmod could not resolve its own member record. Run": {fr:"Stoatmod n’a pas pu retrouver son propre profil de membre. Exécutez",pt:"O Stoatmod não conseguiu encontrar o seu próprio registo de membro. Execute",es:"Stoatmod no pudo encontrar su propio registro de miembro. Ejecuta"},
  "Update the Stoatmod role, then run": {fr:"Mettez à jour le rôle Stoatmod, puis exécutez",pt:"Atualize o cargo do Stoatmod e execute",es:"Actualiza el rol de Stoatmod y ejecuta"},
  "Since 00:00 UTC": {fr:"Depuis 00:00 UTC",pt:"Desde as 00:00 UTC",es:"Desde las 00:00 UTC"},
  "Unique senders today": {fr:"Expéditeurs uniques aujourd’hui",pt:"Remetentes únicos hoje",es:"Remitentes únicos hoy"},
  "Members arriving today": {fr:"Membres arrivés aujourd’hui",pt:"Membros que entraram hoje",es:"Miembros que entraron hoy"},
  "Members leaving today": {fr:"Membres partis aujourd’hui",pt:"Membros que saíram hoje",es:"Miembros que salieron hoy"},
  "Exclude this server from homepage totals, the Trusted by section, and the global leaderboard.": {fr:"Exclure ce serveur des totaux de la page d’accueil, de la section Ils nous font confiance et du classement général.",pt:"Excluir este servidor dos totais da página inicial, da secção Usado por e da classificação global.",es:"Excluir este servidor de los totales de la página de inicio, la sección Confían en nosotros y la clasificación global."},
  "Exclude from global statistics": {fr:"Exclure des statistiques globales",pt:"Excluir das estatísticas globais",es:"Excluir de las estadísticas globales"},
  "This server is currently included in public statistics.": {fr:"Ce serveur figure actuellement dans les statistiques publiques.",pt:"Este servidor está atualmente incluído nas estatísticas públicas.",es:"Este servidor está incluido actualmente en las estadísticas públicas."},
  "This server is excluded from all public statistics.": {fr:"Ce serveur est exclu de toutes les statistiques publiques.",pt:"Este servidor está excluído de todas as estatísticas públicas.",es:"Este servidor está excluido de todas las estadísticas públicas."},
  "Nickname screening": {fr:"Contrôle des surnoms",pt:"Verificação de alcunhas",es:"Comprobación de apodos"},
  "Join verification": {fr:"Vérification à l’arrivée",pt:"Verificação de entrada",es:"Verificación de entrada"},
  "safeguards active": {fr:"protections actives",pt:"proteções ativas",es:"protecciones activas"},
  "Latest 50": {fr:"50 derniers",pt:"50 mais recentes",es:"Últimos 50"},
  "Select a case to investigate": {fr:"Sélectionnez un dossier à examiner",pt:"Selecione um caso para investigar",es:"Selecciona un caso para investigar"},
  "Member review": {fr:"Examen du membre",pt:"Revisão do membro",es:"Revisión del miembro"},
  "Audit trail": {fr:"Piste d’audit",pt:"Rasto de auditoria",es:"Registro de auditoría"},
  "Latest 100 events": {fr:"100 derniers événements",pt:"100 eventos mais recentes",es:"Últimos 100 eventos"},
  "Live configuration": {fr:"Configuration en direct",pt:"Configuração em direto",es:"Configuración en directo"},
  "Challenge accounts younger than 14 days.": {fr:"Vérifier les comptes de moins de 14 jours.",pt:"Verificar contas com menos de 14 dias.",es:"Verificar las cuentas con menos de 14 días."},
  "Require verification for every non-bot member who joins. Off by default.": {fr:"Exiger une vérification pour chaque nouveau membre non robot. Désactivé par défaut.",pt:"Exigir verificação para cada novo membro que não seja bot. Desativado por predefinição.",es:"Exigir verificación a cada miembro nuevo que no sea un bot. Desactivado de forma predeterminada."},
  "Ban matching accounts from this server only. Raw IPs are restricted to the global owner.": {fr:"Bannir les comptes correspondants de ce serveur uniquement. Les adresses IP brutes sont réservées au propriétaire global.",pt:"Banir contas correspondentes apenas deste servidor. Os IPs brutos são restritos ao proprietário global.",es:"Prohibir las cuentas coincidentes solo en este servidor. Las IP sin procesar están restringidas al propietario global."},
  "Check other changed usernames and server nicknames. Zero-tolerance literal-name rules stay active.": {fr:"Contrôler les autres noms d’utilisateur et surnoms de serveur modifiés. Les règles littérales de tolérance zéro restent actives.",pt:"Verificar outros nomes de utilizador e alcunhas de servidor alterados. As regras literais de tolerância zero permanecem ativas.",es:"Comprobar otros nombres de usuario y apodos de servidor modificados. Las reglas literales de tolerancia cero siguen activas."},
  "Remove messages containing external links.": {fr:"Supprimer les messages contenant des liens externes.",pt:"Remover mensagens que contenham links externos.",es:"Eliminar mensajes que contengan enlaces externos."},
  "Allow gifbox.me links when link protection is enabled.": {fr:"Autoriser les liens gifbox.me lorsque la protection des liens est activée.",pt:"Permitir links gifbox.me quando a proteção de links está ativada.",es:"Permitir enlaces de gifbox.me cuando la protección de enlaces está activada."},
  "Scan image attachments with the moderation model.": {fr:"Analyser les images jointes avec le modèle de modération.",pt:"Analisar anexos de imagem com o modelo de moderação.",es:"Analizar los archivos de imagen adjuntos con el modelo de moderación."},
  "Experimental image moderation for violence and explicit sexual content only. It may not be accurate. Off by default; enable it separately for each server.": {fr:"Modération expérimentale des images, uniquement pour la violence et le contenu sexuel explicite. Elle peut être inexacte. Désactivée par défaut ; activez-la séparément pour chaque serveur.",pt:"Moderação experimental de imagens apenas para violência e conteúdo sexual explícito. Pode não ser precisa. Desativada por padrão; ative-a separadamente em cada servidor.",es:"Moderación experimental de imágenes solo para violencia y contenido sexual explícito. Puede no ser precisa. Desactivada de forma predeterminada; actívala por separado en cada servidor."},
  "Exclude elevated members from automatic moderation.": {fr:"Exclure les membres privilégiés de la modération automatique.",pt:"Excluir membros com privilégios da moderação automática.",es:"Excluir a los miembros con privilegios de la moderación automática."},
  "Select a category or individual channel to skip automatic moderation.": {fr:"Sélectionnez une catégorie ou un salon à exclure de la modération automatique.",pt:"Selecione uma categoria ou canal individual a ignorar na moderação automática.",es:"Selecciona una categoría o canal individual para omitir la moderación automática."},
  "Choose multiple categories": {fr:"Choisir plusieurs catégories",pt:"Escolher várias categorias",es:"Elegir varias categorías"},
  "Included categories can trigger moderation when they exceed your sensitivity threshold. Excluded categories are ignored. Self-harm categories always remain included for safety.": {fr:"Les catégories incluses peuvent déclencher la modération lorsqu’elles dépassent votre seuil de sensibilité. Les catégories exclues sont ignorées. Les catégories d’automutilation restent toujours incluses par sécurité.",pt:"As categorias incluídas podem acionar a moderação quando excedem o limite de sensibilidade. As categorias excluídas são ignoradas. As categorias de automutilação permanecem sempre incluídas por segurança.",es:"Las categorías incluidas pueden activar la moderación cuando superan tu umbral de sensibilidad. Las categorías excluidas se ignoran. Las categorías de autolesión siempre permanecen incluidas por seguridad."},
  "Removes this server from homepage totals, Trusted by, and the global leaderboard.": {fr:"Retire ce serveur des totaux de la page d’accueil, de la section Ils nous font confiance et du classement général.",pt:"Remove este servidor dos totais da página inicial, da secção Usado por e da classificação global.",es:"Elimina este servidor de los totales de la página de inicio, Confían en nosotros y la clasificación global."},
  "Stoatmod support": {fr:"Assistance Stoatmod",pt:"Suporte do Stoatmod",es:"Soporte de Stoatmod"},
  "Include the server ID below and any case reference when contacting support.": {fr:"Indiquez l’identifiant du serveur ci-dessous et toute référence de dossier lorsque vous contactez l’assistance.",pt:"Inclua o ID do servidor abaixo e qualquer referência de caso ao contactar o suporte.",es:"Incluye el ID del servidor que aparece abajo y cualquier referencia de caso al contactar con soporte."},
  "Join support server": {fr:"Rejoindre le serveur d’assistance",pt:"Entrar no servidor de suporte",es:"Entrar al servidor de soporte"},
  "Run a health check": {fr:"Effectuer un contrôle de santé",pt:"Executar uma verificação de estado",es:"Ejecutar una comprobación de estado"},
  "Refresh access": {fr:"Actualiser l’accès",pt:"Atualizar acesso",es:"Actualizar acceso"},
  "Read the command guide": {fr:"Lire le guide des commandes",pt:"Ler o guia de comandos",es:"Leer la guía de comandos"},
  "Review every command and its required permissions before changing protection settings.": {fr:"Consultez chaque commande et ses autorisations requises avant de modifier les paramètres de protection.",pt:"Reveja cada comando e as permissões necessárias antes de alterar as definições de proteção.",es:"Revisa cada comando y sus permisos necesarios antes de cambiar la configuración de protección."},
  "Server": {fr:"Serveur",pt:"Servidor",es:"Servidor"},
  "Server ID": {fr:"ID du serveur",pt:"ID do servidor",es:"ID del servidor"},
  "Log channel": {fr:"Salon du journal",pt:"Canal de registo",es:"Canal de registro"},
  "Last snapshot": {fr:"Dernier instantané",pt:"Último instantâneo",es:"Última instantánea"},
  "Not configured": {fr:"Non configuré",pt:"Não configurado",es:"No configurado"},
  "Back to Stoatmod": {fr:"Retour à Stoatmod",pt:"Voltar ao Stoatmod",es:"Volver a Stoatmod"},
  "Moderator access": {fr:"Accès modérateur",pt:"Acesso de moderador",es:"Acceso de moderador"},
  "Keep your community": {fr:"Gardez votre communauté",pt:"Mantenha a sua comunidade",es:"Mantén tu comunidad"},
  "in good shape.": {fr:"en bonne santé.",pt:"em boa forma.",es:"en buena forma."},
  "Review activity, resolve cases, and tune protections without leaving the dashboard.": {fr:"Consultez l’activité, traitez les dossiers et ajustez les protections sans quitter le tableau de bord.",pt:"Reveja a atividade, resolva casos e ajuste as proteções sem sair do painel.",es:"Revisa la actividad, resuelve casos y ajusta las protecciones sin salir del panel."},
  "Secure handoff": {fr:"Transfert sécurisé",pt:"Transferência segura",es:"Transferencia segura"},
  "Enter your dashboard code": {fr:"Saisissez votre code de tableau de bord",pt:"Introduza o código do painel",es:"Introduce el código del panel"},
  "Run": {fr:"Exécutez",pt:"Execute",es:"Ejecuta"},
  "in your server. Stoatmod will DM you a one-time code.": {fr:"sur votre serveur. Stoatmod vous enverra un code à usage unique par message privé.",pt:"no seu servidor. O Stoatmod enviará um código de utilização única por mensagem privada.",es:"en tu servidor. Stoatmod te enviará un código de un solo uso por mensaje privado."},
  "Eight-character code": {fr:"Code de huit caractères",pt:"Código de oito caracteres",es:"Código de ocho caracteres"},
  "Open dashboard": {fr:"Ouvrir le tableau de bord",pt:"Abrir painel",es:"Abrir panel"},
  "Codes expire after 10 minutes · Sessions last 12 hours": {fr:"Les codes expirent après 10 minutes · Les sessions durent 12 heures",pt:"Os códigos expiram após 10 minutos · As sessões duram 12 horas",es:"Los códigos caducan a los 10 minutos · Las sesiones duran 12 horas"},
  "Sign-in failed.": {fr:"Échec de la connexion.",pt:"Falha no início de sessão.",es:"Error de inicio de sesión."},
  "The dashboard code is invalid or expired.": {fr:"Le code du tableau de bord est invalide ou expiré.",pt:"O código do painel é inválido ou expirou.",es:"El código del panel no es válido o ha caducado."},
  "Stoatmod documentation": {fr:"Documentation Stoatmod",pt:"Documentação do Stoatmod",es:"Documentación de Stoatmod"},
  "Command reference.": {fr:"Référence des commandes.",pt:"Referência de comandos.",es:"Referencia de comandos."},
  "Everything moderators need to configure Stoatmod and keep their community protected.": {fr:"Tout ce dont les modérateurs ont besoin pour configurer Stoatmod et protéger leur communauté.",pt:"Tudo o que os moderadores precisam para configurar o Stoatmod e manter a comunidade protegida.",es:"Todo lo que los moderadores necesitan para configurar Stoatmod y mantener protegida su comunidad."},
  "On this page": {fr:"Sur cette page",pt:"Nesta página",es:"En esta página"},
  "Permissions": {fr:"Autorisations",pt:"Permissões",es:"Permisos"},
  "Commands": {fr:"Commandes",pt:"Comandos",es:"Comandos"},
  "Need the control room?": {fr:"Besoin du centre de contrôle ?",pt:"Precisa da sala de controlo?",es:"¿Necesitas la sala de control?"},
  "Required permissions": {fr:"Autorisations requises",pt:"Permissões necessárias",es:"Permisos necesarios"},
  "The bot's role must sit above every member role it needs to moderate and every automatic role it needs to assign.": {fr:"Le rôle du bot doit se trouver au-dessus de chaque rôle de membre qu’il doit modérer et de chaque rôle automatique qu’il doit attribuer.",pt:"O cargo do bot deve estar acima de todos os cargos de membros que precisa de moderar e de todos os cargos automáticos que precisa de atribuir.",es:"El rol del bot debe estar por encima de cada rol de miembro que necesite moderar y de cada rol automático que necesite asignar."},
  "View channels": {fr:"Voir les salons",pt:"Ver canais",es:"Ver canales"},
  "Send messages": {fr:"Envoyer des messages",pt:"Enviar mensagens",es:"Enviar mensajes"},
  "Manage messages": {fr:"Gérer les messages",pt:"Gerir mensagens",es:"Gestionar mensajes"},
  "Manage roles": {fr:"Gérer les rôles",pt:"Gerir cargos",es:"Gestionar roles"},
  "Manage nicknames": {fr:"Gérer les surnoms",pt:"Gerir alcunhas",es:"Gestionar apodos"},
  "Moderate members": {fr:"Modérer les membres",pt:"Moderar membros",es:"Moderar miembros"},
  "Kick members": {fr:"Expulser des membres",pt:"Expulsar membros",es:"Expulsar miembros"},
  "Ban members": {fr:"Bannir des membres",pt:"Banir membros",es:"Bloquear miembros"},
  "Read message history": {fr:"Lire l’historique des messages",pt:"Ler histórico de mensagens",es:"Leer el historial de mensajes"},
  "Role hierarchy": {fr:"Hiérarchie des rôles",pt:"Hierarquia de cargos",es:"Jerarquía de roles"},
  "Move the Stoatmod role above automatic roles and ordinary member roles. Stoat rejects role, nickname, timeout, kick or ban actions when the hierarchy is incorrect.": {fr:"Placez le rôle Stoatmod au-dessus des rôles automatiques et des rôles de membres ordinaires. Stoat refuse les actions sur les rôles, surnoms, exclusions temporaires, expulsions ou bannissements lorsque la hiérarchie est incorrecte.",pt:"Mova o cargo do Stoatmod para cima dos cargos automáticos e dos cargos comuns de membros. O Stoat rejeita ações de cargo, alcunha, suspensão, expulsão ou banimento quando a hierarquia está incorreta.",es:"Mueve el rol de Stoatmod por encima de los roles automáticos y los roles de miembros normales. Stoat rechaza acciones de rol, apodo, suspensión, expulsión o bloqueo cuando la jerarquía es incorrecta."},
  "Every command": {fr:"Toutes les commandes",pt:"Todos os comandos",es:"Todos los comandos"},
  "Server IDs, role IDs and case IDs can be copied directly from Stoat.": {fr:"Les identifiants de serveur, de rôle et de dossier peuvent être copiés directement depuis Stoat.",pt:"Os IDs de servidor, cargo e caso podem ser copiados diretamente do Stoat.",es:"Los ID de servidor, rol y caso se pueden copiar directamente desde Stoat."},
  "Search commands": {fr:"Rechercher des commandes",pt:"Pesquisar comandos",es:"Buscar comandos"},
  "Try auto-role…": {fr:"Essayez auto-role…",pt:"Experimente auto-role…",es:"Prueba auto-role…"},
  "No command matches": {fr:"Aucune commande ne correspond à",pt:"Nenhum comando corresponde a",es:"Ningún comando coincide con"},
  "Commands and permissions for server moderators.": {fr:"Commandes et autorisations pour les modérateurs du serveur.",pt:"Comandos e permissões para moderadores do servidor.",es:"Comandos y permisos para moderadores del servidor."},
  "Show the command guide.": {fr:"Afficher le guide des commandes.",pt:"Mostrar o guia de comandos.",es:"Mostrar la guía de comandos."},
  "Show the official support server and support email address.": {fr:"Afficher le serveur d’assistance officiel et l’adresse e-mail d’assistance.",pt:"Mostrar o servidor de suporte oficial e o endereço de e-mail de suporte.",es:"Mostrar el servidor oficial de soporte y la dirección de correo de soporte."},
  "Show bot and server information.": {fr:"Afficher les informations du bot et du serveur.",pt:"Mostrar informações do bot e do servidor.",es:"Mostrar información del bot y del servidor."},
  "Audit permissions, role hierarchy, automatic roles, log access and dashboard readiness.": {fr:"Auditer les autorisations, la hiérarchie des rôles, les rôles automatiques, l’accès au journal et l’état du tableau de bord.",pt:"Auditar permissões, hierarquia de cargos, cargos automáticos, acesso ao registo e disponibilidade do painel.",es:"Auditar permisos, jerarquía de roles, roles automáticos, acceso al registro y disponibilidad del panel."},
  "DM a moderator a single-use website login code.": {fr:"Envoyer à un modérateur un code de connexion au site à usage unique par message privé.",pt:"Enviar a um moderador um código de início de sessão de utilização única por mensagem privada.",es:"Enviar por mensaje privado a un moderador un código de acceso web de un solo uso."},
  "List a member's active warnings.": {fr:"Afficher les avertissements actifs d’un membre.",pt:"Listar as advertências ativas de um membro.",es:"Mostrar las advertencias activas de un miembro."},
  "Create a warning and apply the configured escalation policy.": {fr:"Créer un avertissement et appliquer la politique d’escalade configurée.",pt:"Criar uma advertência e aplicar a política de escalada configurada.",es:"Crear una advertencia y aplicar la política de escalado configurada."},
  "Remove a warning or moderation case.": {fr:"Supprimer un avertissement ou un dossier de modération.",pt:"Remover uma advertência ou caso de moderação.",es:"Eliminar una advertencia o caso de moderación."},
  "View one moderation case.": {fr:"Afficher un dossier de modération.",pt:"Ver um caso de moderação.",es:"Ver un caso de moderación."},
  "List recent cases for a member.": {fr:"Afficher les dossiers récents d’un membre.",pt:"Listar casos recentes de um membro.",es:"Mostrar los casos recientes de un miembro."},
  "Accept a submitted appeal and reverse an eligible warning, timeout or ban.": {fr:"Accepter un recours envoyé et annuler un avertissement, une exclusion temporaire ou un bannissement admissible.",pt:"Aceitar um recurso enviado e reverter uma advertência, suspensão ou banimento elegível.",es:"Aceptar una apelación enviada y revertir una advertencia, suspensión o bloqueo apto."},
  "Deny a submitted appeal and notify the member of the decision.": {fr:"Refuser un recours envoyé et informer le membre de la décision.",pt:"Recusar um recurso enviado e notificar o membro da decisão.",es:"Denegar una apelación enviada y notificar la decisión al miembro."},
  "Temporarily mute a member.": {fr:"Rendre temporairement un membre muet.",pt:"Silenciar temporariamente um membro.",es:"Silenciar temporalmente a un miembro."},
  "Remove a member's mute.": {fr:"Rétablir la parole d’un membre.",pt:"Remover o silenciamento de um membro.",es:"Quitar el silencio a un miembro."},
  "Kick a member and record the reason.": {fr:"Expulser un membre et enregistrer la raison.",pt:"Expulsar um membro e registar o motivo.",es:"Expulsar a un miembro y registrar el motivo."},
  "Ban a user and record the reason.": {fr:"Bannir un utilisateur et enregistrer la raison.",pt:"Banir um utilizador e registar o motivo.",es:"Bloquear a un usuario y registrar el motivo."},
  "View or change warning escalation counts.": {fr:"Afficher ou modifier les seuils d’escalade des avertissements.",pt:"Ver ou alterar as contagens de escalada de advertências.",es:"Ver o cambiar los umbrales de escalado de advertencias."},
  "View or change AI moderation sensitivity.": {fr:"Afficher ou modifier la sensibilité de la modération par IA.",pt:"Ver ou alterar a sensibilidade da moderação por IA.",es:"Ver o cambiar la sensibilidad de moderación por IA."},
  "View or change AI moderation sensitivity. Values below 90% require a second confirmation command.": {fr:"Affichez ou modifiez la sensibilité de la modération par IA. Les valeurs inférieures à 90 % nécessitent une deuxième commande de confirmation.",pt:"Veja ou altere a sensibilidade da moderação por IA. Valores inferiores a 90% exigem um segundo comando de confirmação.",es:"Consulta o cambia la sensibilidad de moderación por IA. Los valores inferiores al 90 % requieren un segundo comando de confirmación."},
  "Confirm a matching threshold request within five minutes.": {fr:"Confirmez une demande de seuil correspondante dans les cinq minutes.",pt:"Confirme um pedido de limite correspondente no prazo de cinco minutos.",es:"Confirma una solicitud de umbral coincidente en un plazo de cinco minutos."},
  "View enabled AI moderation categories.": {fr:"Afficher les catégories de modération par IA activées.",pt:"Ver as categorias de moderação por IA ativadas.",es:"Ver las categorías de moderación por IA activadas."},
  "Require verification for suspicious new accounts.": {fr:"Exiger une vérification pour les nouveaux comptes suspects.",pt:"Exigir verificação para novas contas suspeitas.",es:"Exigir verificación a las cuentas nuevas sospechosas."},
  "Remove a member's pending CAPTCHA restriction.": {fr:"Retirer la restriction CAPTCHA en attente d’un membre.",pt:"Remover a restrição CAPTCHA pendente de um membro.",es:"Quitar la restricción CAPTCHA pendiente de un miembro."},
  "Scan usernames and changed server nicknames.": {fr:"Analyser les noms d’utilisateur et les surnoms du serveur modifiés.",pt:"Analisar nomes de utilizador e alcunhas do servidor alterados.",es:"Analizar nombres de usuario y apodos del servidor modificados."},
  "Scan uploaded images for unsafe content.": {fr:"Analyser les images importées à la recherche de contenu dangereux.",pt:"Analisar imagens carregadas quanto a conteúdo inseguro.",es:"Analizar las imágenes subidas en busca de contenido inseguro."},
  "Choose whether moderators bypass automatic checks.": {fr:"Choisir si les modérateurs contournent les contrôles automatiques.",pt:"Escolher se os moderadores ignoram as verificações automáticas.",es:"Elegir si los moderadores omiten las comprobaciones automáticas."},
  "Add a role that every new member receives; repeat for multiple roles.": {fr:"Ajouter un rôle attribué à chaque nouveau membre ; répéter pour plusieurs rôles.",pt:"Adicionar um cargo que todos os novos membros recebem; repetir para vários cargos.",es:"Añadir un rol que reciba cada miembro nuevo; repetir para varios roles."},
  "Remove one role from the automatic role list.": {fr:"Retirer un rôle de la liste des rôles automatiques.",pt:"Remover um cargo da lista de cargos automáticos.",es:"Eliminar un rol de la lista de roles automáticos."},
  "Disable all automatic roles for the server.": {fr:"Désactiver tous les rôles automatiques du serveur.",pt:"Desativar todos os cargos automáticos do servidor.",es:"Desactivar todos los roles automáticos del servidor."},
  "Choose the channel for moderation logs.": {fr:"Choisir le salon des journaux de modération.",pt:"Escolher o canal dos registos de moderação.",es:"Elegir el canal para los registros de moderación."},
  "Exclude a channel from automatic moderation.": {fr:"Exclure un salon de la modération automatique.",pt:"Excluir um canal da moderação automática.",es:"Excluir un canal de la moderación automática."},
  "Re-enable automatic moderation in a channel.": {fr:"Réactiver la modération automatique dans un salon.",pt:"Reativar a moderação automática num canal.",es:"Volver a activar la moderación automática en un canal."},
  "Discovery": {fr:"Découverte",pt:"Descoberta",es:"Descubrimiento"},
  "Discovery announcement": {fr:"Annonce Découverte",pt:"Anúncio da Descoberta",es:"Anuncio de Descubrimiento"},
  "Dismiss Discovery announcement": {fr:"Fermer l’annonce Découverte",pt:"Fechar o anúncio da Descoberta",es:"Cerrar el anuncio de Descubrimiento"},
  "You can now advertise your server using our Discovery page.": {fr:"Vous pouvez désormais promouvoir votre serveur sur notre page Découverte.",pt:"Agora pode divulgar o seu servidor na nossa página Descoberta.",es:"Ahora puedes anunciar tu servidor en nuestra página de Descubrimiento."},
  "Check your eligibility →": {fr:"Vérifier votre admissibilité →",pt:"Verificar elegibilidade →",es:"Comprobar elegibilidad →"},
  "Public server directory": {fr:"Annuaire public des serveurs",pt:"Diretório público de servidores",es:"Directorio público de servidores"},
  "Manage": {fr:"Gérer",pt:"Gerir",es:"Gestionar"},
  "Put": {fr:"Ajouter",pt:"Colocar",es:"Añadir"},
  "on Discovery": {fr:"dans Découverte",pt:"na Descoberta",es:"en Descubrimiento"},
  "in Discovery": {fr:"dans Découverte",pt:"na Descoberta",es:"en Descubrimiento"},
  "Discovery helps people find Stoat communities that use StoatMod and have completed the full setup. Applications are reviewed by the StoatMod owner before they become public.": {fr:"Découverte aide les utilisateurs à trouver des communautés Stoat qui utilisent StoatMod et ont terminé la configuration complète. Les candidatures sont examinées par le propriétaire de StoatMod avant leur publication.",pt:"A Descoberta ajuda as pessoas a encontrar comunidades Stoat que utilizam o StoatMod e concluíram toda a configuração. As candidaturas são analisadas pelo proprietário do StoatMod antes de se tornarem públicas.",es:"Descubrimiento ayuda a encontrar comunidades de Stoat que usan StoatMod y han completado toda la configuración. El propietario de StoatMod revisa las solicitudes antes de publicarlas."},
  "View Discovery ↗": {fr:"Voir Découverte ↗",pt:"Ver Descoberta ↗",es:"Ver Descubrimiento ↗"},
  "Listing promotion": {fr:"Promotion de l’annonce",pt:"Promoção do anúncio",es:"Promoción del anuncio"},
  "Bump your server": {fr:"Remonter votre serveur",pt:"Impulsionar o servidor",es:"Impulsar tu servidor"},
  "Move this listing to the top of Recently bumped. Each approved server can be bumped once every two hours.": {fr:"Placez cette annonce en tête des remontées récentes. Chaque serveur approuvé peut être remonté une fois toutes les deux heures.",pt:"Mova este anúncio para o topo dos impulsionados recentemente. Cada servidor aprovado pode ser impulsionado uma vez a cada duas horas.",es:"Mueve este anuncio al principio de los impulsados recientemente. Cada servidor aprobado puede impulsarse una vez cada dos horas."},
  "Next bump available in": {fr:"Prochaine remontée disponible dans",pt:"Próximo impulso disponível em",es:"Próximo impulso disponible en"},
  "Your listing is ready to bump": {fr:"Votre annonce peut être remontée",pt:"O anúncio está pronto para ser impulsionado",es:"Tu anuncio está listo para impulsarse"},
  "Ready now": {fr:"Disponible maintenant",pt:"Disponível agora",es:"Disponible ahora"},
  "Bumping…": {fr:"Remontée…",pt:"A impulsionar…",es:"Impulsando…"},
  "Bump server": {fr:"Remonter le serveur",pt:"Impulsionar servidor",es:"Impulsar servidor"},
  "Application checklist": {fr:"Liste de vérification",pt:"Lista de verificação",es:"Lista de comprobación"},
  "Ready to apply": {fr:"Prêt à candidater",pt:"Pronto para candidatar",es:"Listo para solicitar"},
  "Complete every requirement": {fr:"Remplissez toutes les conditions",pt:"Cumpra todos os requisitos",es:"Completa todos los requisitos"},
  "StoatMod is in the server": {fr:"StoatMod est dans le serveur",pt:"O StoatMod está no servidor",es:"StoatMod está en el servidor"},
  "The bot must be connected and sending server snapshots.": {fr:"Le bot doit être connecté et envoyer des instantanés du serveur.",pt:"O bot deve estar ligado e a enviar instantâneos do servidor.",es:"El bot debe estar conectado y enviar instantáneas del servidor."},
  "All required permissions": {fr:"Toutes les autorisations requises",pt:"Todas as permissões necessárias",es:"Todos los permisos necesarios"},
  "Run ~setup after granting every permission shown in the audit.": {fr:"Exécutez ~setup après avoir accordé toutes les autorisations indiquées dans l’audit.",pt:"Execute ~setup depois de conceder todas as permissões mostradas na auditoria.",es:"Ejecuta ~setup después de conceder todos los permisos mostrados en la auditoría."},
  "Server icon": {fr:"Icône du serveur",pt:"Ícone do servidor",es:"Icono del servidor"},
  "Add a recognizable icon to your Stoat server.": {fr:"Ajoutez une icône reconnaissable à votre serveur Stoat.",pt:"Adicione um ícone reconhecível ao seu servidor Stoat.",es:"Añade un icono reconocible a tu servidor de Stoat."},
  "Global statistics enabled": {fr:"Statistiques globales activées",pt:"Estatísticas globais ativadas",es:"Estadísticas globales activadas"},
  "The server must be included in public aggregate statistics.": {fr:"Le serveur doit être inclus dans les statistiques publiques agrégées.",pt:"O servidor deve estar incluído nas estatísticas públicas agregadas.",es:"El servidor debe incluirse en las estadísticas públicas agregadas."},
  "Open settings": {fr:"Ouvrir les paramètres",pt:"Abrir definições",es:"Abrir ajustes"},
  "Listing details": {fr:"Détails de l’annonce",pt:"Detalhes do anúncio",es:"Detalles del anuncio"},
  "Describe your community": {fr:"Décrivez votre communauté",pt:"Descreva a sua comunidade",es:"Describe tu comunidad"},
  "Your application is waiting for an owner decision. You can keep editing the public description while it is reviewed.": {fr:"Votre candidature attend la décision du propriétaire. Vous pouvez continuer à modifier la description publique pendant son examen.",pt:"A candidatura aguarda uma decisão do proprietário. Pode continuar a editar a descrição pública durante a análise.",es:"Tu solicitud espera la decisión del propietario. Puedes seguir editando la descripción pública mientras se revisa."},
  "Approved. Your server is public while all four requirements remain satisfied.": {fr:"Approuvé. Votre serveur reste public tant que les quatre conditions sont remplies.",pt:"Aprovado. O servidor permanece público enquanto os quatro requisitos forem cumpridos.",es:"Aprobado. Tu servidor será público mientras se cumplan los cuatro requisitos."},
  "Discovery approval was revoked": {fr:"L’approbation Découverte a été révoquée",pt:"A aprovação da Descoberta foi revogada",es:"La aprobación de Descubrimiento fue revocada"},
  "Update the listing and apply again when ready.": {fr:"Mettez l’annonce à jour et présentez une nouvelle candidature lorsqu’elle est prête.",pt:"Atualize o anúncio e candidate-se novamente quando estiver pronto.",es:"Actualiza el anuncio y vuelve a solicitarlo cuando esté listo."},
  "You can apply again after": {fr:"Vous pourrez candidater à nouveau après",pt:"Pode candidatar-se novamente depois de",es:"Puedes volver a solicitarlo después de"},
  "Server description": {fr:"Description du serveur",pt:"Descrição do servidor",es:"Descripción del servidor"},
  "What kind of community is this, and who is it for?": {fr:"Quel type de communauté est-ce et à qui s’adresse-t-elle ?",pt:"Que tipo de comunidade é esta e a quem se destina?",es:"¿Qué tipo de comunidad es y para quién está pensada?"},
  "Server invite": {fr:"Invitation du serveur",pt:"Convite do servidor",es:"Invitación del servidor"},
  "Required": {fr:"Obligatoire",pt:"Obrigatório",es:"Obligatorio"},
  "Only HTTPS Stoat invite links are accepted. This becomes the public Join button after approval.": {fr:"Seuls les liens d’invitation HTTPS de Stoat sont acceptés. Après approbation, ce lien devient le bouton public Rejoindre.",pt:"Apenas são aceites links de convite HTTPS do Stoat. Após a aprovação, este será o botão público Entrar.",es:"Solo se aceptan enlaces de invitación HTTPS de Stoat. Tras la aprobación, será el botón público Entrar."},
  "Discovery tags": {fr:"Étiquettes Découverte",pt:"Etiquetas da Descoberta",es:"Etiquetas de Descubrimiento"},
  "Add up to five topics that help people find your server.": {fr:"Ajoutez jusqu’à cinq thèmes pour aider les utilisateurs à trouver votre serveur.",pt:"Adicione até cinco tópicos que ajudem as pessoas a encontrar o servidor.",es:"Añade hasta cinco temas que ayuden a encontrar tu servidor."},
  "Add tag": {fr:"Ajouter une étiquette",pt:"Adicionar etiqueta",es:"Añadir etiqueta"},
  "No tags added yet.": {fr:"Aucune étiquette ajoutée.",pt:"Ainda não foram adicionadas etiquetas.",es:"Aún no se han añadido etiquetas."},
  "More information": {fr:"Plus d’informations",pt:"Mais informações",es:"Más información"},
  "Share the topics, atmosphere, activities, rules, or anything else visitors should know.": {fr:"Présentez les thèmes, l’ambiance, les activités, les règles ou toute autre information utile aux visiteurs.",pt:"Partilhe os tópicos, ambiente, atividades, regras ou qualquer outra informação útil aos visitantes.",es:"Comparte los temas, el ambiente, las actividades, las normas o cualquier otra información útil para los visitantes."},
  "Save details": {fr:"Enregistrer les détails",pt:"Guardar detalhes",es:"Guardar detalles"},
  "Sending…": {fr:"Envoi…",pt:"A enviar…",es:"Enviando…"},
  "Reapply for Discovery": {fr:"Candidater à nouveau à Découverte",pt:"Candidatar novamente à Descoberta",es:"Volver a solicitar Descubrimiento"},
  "Apply for Discovery": {fr:"Candidater à Découverte",pt:"Candidatar à Descoberta",es:"Solicitar Descubrimiento"},
  "Visitor view": {fr:"Vue des visiteurs",pt:"Vista do visitante",es:"Vista del visitante"},
  "Public listing preview": {fr:"Aperçu de l’annonce publique",pt:"Pré-visualização do anúncio público",es:"Vista previa del anuncio público"},
  "Updates as you type": {fr:"Mise à jour pendant la saisie",pt:"Atualiza enquanto escreve",es:"Se actualiza mientras escribes"},
  "Reviewed listing": {fr:"Annonce examinée",pt:"Anúncio analisado",es:"Anuncio revisado"},
  "Listing preview": {fr:"Aperçu de l’annonce",pt:"Pré-visualização do anúncio",es:"Vista previa del anuncio"},
  "Your public server description will appear here.": {fr:"La description publique de votre serveur apparaîtra ici.",pt:"A descrição pública do servidor aparecerá aqui.",es:"La descripción pública de tu servidor aparecerá aquí."},
  "More about this server": {fr:"En savoir plus sur ce serveur",pt:"Mais sobre este servidor",es:"Más sobre este servidor"},
  "Add more information to show visitors what makes this community special.": {fr:"Ajoutez des informations pour montrer aux visiteurs ce qui rend cette communauté unique.",pt:"Adicione mais informações para mostrar aos visitantes o que torna esta comunidade especial.",es:"Añade más información para mostrar qué hace especial a esta comunidad."},
  "Recently bumped": {fr:"Remonté récemment",pt:"Impulsionado recentemente",es:"Impulsado recientemente"},
  "Approved listing": {fr:"Annonce approuvée",pt:"Anúncio aprovado",es:"Anuncio aprobado"},
  "Preview before approval": {fr:"Aperçu avant approbation",pt:"Pré-visualização antes da aprovação",es:"Vista previa antes de la aprobación"},
  "Application sent to the Stoatmod owner for review.": {fr:"Candidature envoyée au propriétaire de Stoatmod pour examen.",pt:"Candidatura enviada ao proprietário do Stoatmod para análise.",es:"Solicitud enviada al propietario de Stoatmod para su revisión."},
  "Discovery listing details saved.": {fr:"Détails de l’annonce Découverte enregistrés.",pt:"Detalhes do anúncio da Descoberta guardados.",es:"Detalles del anuncio de Descubrimiento guardados."},
  "Changes saved. The listing is hidden until the updated content is reviewed.": {fr:"Modifications enregistrées. L’annonce reste masquée jusqu’à l’examen du contenu mis à jour.",pt:"Alterações guardadas. O anúncio fica oculto até o conteúdo atualizado ser revisto.",es:"Cambios guardados. El anuncio queda oculto hasta que se revise el contenido actualizado."},
  "Changing the description, information, invite or tags hides the current listing and sends the updated content back for review.": {fr:"Modifier la description, les informations, l’invitation ou les étiquettes masque l’annonce actuelle et renvoie le contenu à l’examen.",pt:"Alterar a descrição, informações, convite ou etiquetas oculta o anúncio atual e envia o conteúdo novamente para análise.",es:"Cambiar la descripción, la información, la invitación o las etiquetas oculta el anuncio actual y devuelve el contenido a revisión."},
  "Save and resubmit": {fr:"Enregistrer et renvoyer",pt:"Guardar e reenviar",es:"Guardar y reenviar"},
  "Could not save the discovery application.": {fr:"Impossible d’enregistrer la candidature Découverte.",pt:"Não foi possível guardar a candidatura à Descoberta.",es:"No se pudo guardar la solicitud de Descubrimiento."},
  "Listing bumped. Your server has moved to the top of Recently bumped.": {fr:"Annonce remontée. Votre serveur est maintenant en tête des remontées récentes.",pt:"Anúncio impulsionado. O servidor foi movido para o topo dos impulsionados recentemente.",es:"Anuncio impulsado. Tu servidor se ha movido al principio de los impulsados recientemente."},
  "This listing is still on its two-hour bump cooldown.": {fr:"Cette annonce est toujours soumise au délai de deux heures.",pt:"Este anúncio ainda está no período de espera de duas horas.",es:"Este anuncio sigue en su periodo de espera de dos horas."},
  "Could not bump the Discovery listing.": {fr:"Impossible de remonter l’annonce Découverte.",pt:"Não foi possível impulsionar o anúncio da Descoberta.",es:"No se pudo impulsar el anuncio de Descubrimiento."},
  "Showing": {fr:"Affichage",pt:"A mostrar",es:"Mostrando"},
  "of": {fr:"sur",pt:"de",es:"de"},
  "First page": {fr:"Première page",pt:"Primeira página",es:"Primera página"},
  "Previous page": {fr:"Page précédente",pt:"Página anterior",es:"Página anterior"},
  "Next page": {fr:"Page suivante",pt:"Página seguinte",es:"Página siguiente"},
  "Last page": {fr:"Dernière page",pt:"Última página",es:"Última página"},
  "Activity log pagination": {fr:"Pagination du journal d’activité",pt:"Paginação do registo de atividade",es:"Paginación del registro de actividad"},
  "Poll results pagination": {fr:"Pagination des résultats des sondages",pt:"Paginação dos resultados das sondagens",es:"Paginación de los resultados de las encuestas"},
  "Server reports": {fr:"Signalements du serveur",pt:"Denúncias do servidor",es:"Informes del servidor"},
  "Server reporting setup": {fr:"Configuration des signalements du serveur",pt:"Configuração das denúncias do servidor",es:"Configuración de los informes del servidor"},
  "Instruction embed channel": {fr:"Salon du message d’instructions",pt:"Canal da mensagem de instruções",es:"Canal del mensaje de instrucciones"},
  "Enable server reports": {fr:"Activer les signalements du serveur",pt:"Ativar denúncias do servidor",es:"Activar informes del servidor"},
  "Server report inbox": {fr:"Boîte de réception des signalements du serveur",pt:"Caixa de entrada de denúncias do servidor",es:"Bandeja de informes del servidor"},
  "No server reports yet.": {fr:"Aucun signalement du serveur pour le moment.",pt:"Ainda não há denúncias do servidor.",es:"Todavía no hay informes del servidor."},
  "Enforce": {fr:"Appliquer",pt:"Aplicar",es:"Aplicar"},
  "Recommended": {fr:"Recommandé",pt:"Recomendado",es:"Recomendado"},
  "Open Policy Studio": {fr:"Ouvrir le Studio de politiques",pt:"Abrir o Estúdio de políticas",es:"Abrir el Estudio de políticas"},
  "Return to setup guide": {fr:"Revenir au guide de configuration",pt:"Voltar ao guia de configuração",es:"Volver a la guía de configuración"},
  "Add your server to Discovery": {fr:"Ajouter votre serveur à Découverte",pt:"Adicionar o seu servidor à Descoberta",es:"Añadir tu servidor a Descubrimiento"},
  "Explore Discovery": {fr:"Explorer Découverte",pt:"Explorar Descoberta",es:"Explorar Descubrimiento"},
  "Report scammers and ToS violations": {fr:"Signaler les escrocs et les violations des conditions",pt:"Denunciar burlões e violações dos termos",es:"Denunciar estafadores e infracciones de los términos"},
  "See global reporting": {fr:"Voir les signalements globaux",pt:"Ver denúncias globais",es:"Ver informes globales"},
  "Global safety report": {fr:"Signalement de sécurité global",pt:"Denúncia de segurança global",es:"Informe de seguridad global"},
  "Report a user to Stoatmod": {fr:"Signaler un utilisateur à Stoatmod",pt:"Denunciar um utilizador ao Stoatmod",es:"Informar sobre un usuario a Stoatmod"},
  "Continue to secure report": {fr:"Continuer vers le signalement sécurisé",pt:"Continuar para a denúncia segura",es:"Continuar al informe seguro"},
  "Evidence attachments": {fr:"Pièces jointes de preuve",pt:"Anexos de prova",es:"Archivos adjuntos de pruebas"},
  "Choose emoji for option": {fr:"Choisir l’émoji de l’option",pt:"Escolher emoji para a opção",es:"Elegir emoji para la opción"},
  "Emoji selector for option": {fr:"Sélecteur d’émoji pour l’option",pt:"Seletor de emoji para a opção",es:"Selector de emoji para la opción"},
  "Loading all emojis…": {fr:"Chargement de tous les émojis…",pt:"A carregar todos os emojis…",es:"Cargando todos los emojis…"},
  "Search all emojis": {fr:"Rechercher tous les émojis",pt:"Pesquisar todos os emojis",es:"Buscar todos los emojis"},
  "Option label": {fr:"Libellé de l’option",pt:"Nome da opção",es:"Etiqueta de la opción"},
  "Remove option": {fr:"Retirer l’option",pt:"Remover opção",es:"Eliminar opción"},
  "Move the Stoatmod role above this role before adding it.": {fr:"Placez le rôle Stoatmod au-dessus de ce rôle avant de l’ajouter.",pt:"Mova o cargo Stoatmod para cima deste cargo antes de o adicionar.",es:"Mueve el rol de Stoatmod por encima de este rol antes de añadirlo."},
  "Move the Stoatmod role above every new automatic role before adding it.": {fr:"Placez le rôle Stoatmod au-dessus de chaque nouveau rôle automatique avant de l’ajouter.",pt:"Mova o cargo Stoatmod para cima de cada novo cargo automático antes de o adicionar.",es:"Mueve el rol de Stoatmod por encima de cada nuevo rol automático antes de añadirlo."},
  "Owner controls": {fr:"Contrôles du propriétaire",pt:"Controlos do proprietário",es:"Controles del propietario"},
  "Dashboard access": {fr:"Accès au tableau de bord",pt:"Acesso ao painel",es:"Acceso al panel"},
  "Server owner only": {fr:"Propriétaire du serveur uniquement",pt:"Apenas proprietário do servidor",es:"Solo el propietario del servidor"},
  "Choose which server members can sign in. Removing access ends that member's active sessions immediately.": {fr:"Choisissez les membres du serveur autorisés à se connecter. La suppression de l’accès met immédiatement fin aux sessions actives du membre.",pt:"Escolha os membros do servidor que podem iniciar sessão. A remoção do acesso termina imediatamente as sessões ativas desse membro.",es:"Elige qué miembros del servidor pueden iniciar sesión. Al retirar el acceso, sus sesiones activas terminan inmediatamente."},
  "The server owner and members with Manage Server can sign in by default. An owner revocation overrides Manage Server until access is restored.": {fr:"Le propriétaire du serveur et les membres disposant de Gérer le serveur peuvent se connecter par défaut. Une révocation du propriétaire prévaut jusqu’à la restauration de l’accès.",pt:"O proprietário do servidor e os membros com Gerir servidor podem iniciar sessão por predefinição. Uma revogação do proprietário prevalece até o acesso ser restaurado.",es:"El propietario del servidor y los miembros con Gestionar servidor pueden iniciar sesión de forma predeterminada. Una revocación del propietario prevalece hasta que se restaure el acceso."},
  "Grant access to a member": {fr:"Accorder l’accès à un membre",pt:"Conceder acesso a um membro",es:"Conceder acceso a un miembro"},
  "Stoat user ID for dashboard access": {fr:"Identifiant Stoat pour l’accès au tableau de bord",pt:"ID de utilizador Stoat para acesso ao painel",es:"ID de usuario de Stoat para acceder al panel"},
  "Grant access": {fr:"Accorder l’accès",pt:"Conceder acesso",es:"Conceder acceso"},
  "People with dashboard access": {fr:"Personnes ayant accès au tableau de bord",pt:"Pessoas com acesso ao painel",es:"Personas con acceso al panel"},
  "Server owner": {fr:"Propriétaire du serveur",pt:"Proprietário do servidor",es:"Propietario del servidor"},
  "Access granted": {fr:"Accès accordé",pt:"Acesso concedido",es:"Acceso concedido"},
  "Manage Server permission": {fr:"Permission Gérer le serveur",pt:"Permissão Gerir servidor",es:"Permiso Gestionar servidor"},
  "Access granted by owner": {fr:"Accès accordé par le propriétaire",pt:"Acesso concedido pelo proprietário",es:"Acceso concedido por el propietario"},
  "active session": {fr:"session active",pt:"sessão ativa",es:"sesión activa"},
  "active sessions": {fr:"sessions actives",pt:"sessões ativas",es:"sesiones activas"},
  "Remove access": {fr:"Retirer l’accès",pt:"Remover acesso",es:"Retirar acceso"},
  "Revoked access": {fr:"Accès révoqués",pt:"Acessos revogados",es:"Accesos revocados"},
  "These owner blocks continue to apply while the member still has Manage Server.": {fr:"Ces blocages du propriétaire restent applicables tant que le membre dispose de Gérer le serveur.",pt:"Estes bloqueios do proprietário continuam a aplicar-se enquanto o membro tiver Gerir servidor.",es:"Estos bloqueos del propietario siguen aplicándose mientras el miembro tenga Gestionar servidor."},
  "People blocked from dashboard access": {fr:"Personnes privées d’accès au tableau de bord",pt:"Pessoas bloqueadas do acesso ao painel",es:"Personas sin acceso al panel"},
  "Revoked by owner": {fr:"Révoqué par le propriétaire",pt:"Revogado pelo proprietário",es:"Revocado por el propietario"},
  "Still has Manage Server": {fr:"Dispose toujours de Gérer le serveur",pt:"Ainda tem Gerir servidor",es:"Aún tiene Gestionar servidor"},
  "No Manage Server permission": {fr:"Sans permission Gérer le serveur",pt:"Sem permissão Gerir servidor",es:"Sin permiso Gestionar servidor"},
  "Restore default access": {fr:"Restaurer l’accès par défaut",pt:"Restaurar acesso predefinido",es:"Restaurar acceso predeterminado"},
  "Revoke all sessions": {fr:"Révoquer toutes les sessions",pt:"Revogar todas as sessões",es:"Revocar todas las sesiones"},
  "Sign everyone out of this server dashboard. Access permissions stay unchanged, but every user will need a fresh code.": {fr:"Déconnecte tout le monde du tableau de bord de ce serveur. Les autorisations restent inchangées, mais chaque utilisateur devra obtenir un nouveau code.",pt:"Termina todas as sessões do painel deste servidor. As permissões de acesso mantêm-se, mas todos precisarão de um novo código.",es:"Cierra todas las sesiones del panel de este servidor. Los permisos no cambian, pero todos necesitarán un código nuevo."},
  "Working…": {fr:"Traitement…",pt:"A processar…",es:"Procesando…"},
  "Enter a Stoat user ID.": {fr:"Saisissez un identifiant utilisateur Stoat.",pt:"Introduza um ID de utilizador Stoat.",es:"Introduce un ID de usuario de Stoat."},
  "Dashboard access granted.": {fr:"Accès au tableau de bord accordé.",pt:"Acesso ao painel concedido.",es:"Acceso al panel concedido."},
  "Dashboard access revoked.": {fr:"Accès au tableau de bord révoqué.",pt:"Acesso ao painel revogado.",es:"Acceso al panel revocado."},
  "Default dashboard access restored.": {fr:"Accès par défaut au tableau de bord restauré.",pt:"Acesso predefinido ao painel restaurado.",es:"Acceso predeterminado al panel restaurado."},
  "Could not grant dashboard access.": {fr:"Impossible d’accorder l’accès au tableau de bord.",pt:"Não foi possível conceder acesso ao painel.",es:"No se pudo conceder acceso al panel."},
  "Could not revoke dashboard access.": {fr:"Impossible de révoquer l’accès au tableau de bord.",pt:"Não foi possível revogar o acesso ao painel.",es:"No se pudo revocar el acceso al panel."},
  "Could not restore dashboard access.": {fr:"Impossible de restaurer l’accès au tableau de bord.",pt:"Não foi possível restaurar o acesso ao painel.",es:"No se pudo restaurar el acceso al panel."},
  "Could not revoke dashboard sessions.": {fr:"Impossible de révoquer les sessions du tableau de bord.",pt:"Não foi possível revogar as sessões do painel.",es:"No se pudieron revocar las sesiones del panel."},
  "Remove dashboard access for this user? Their active sessions will end immediately.": {fr:"Retirer l’accès au tableau de bord de cet utilisateur ? Ses sessions actives prendront fin immédiatement.",pt:"Remover o acesso deste utilizador ao painel? As sessões ativas terminarão imediatamente.",es:"¿Retirar el acceso al panel de este usuario? Sus sesiones activas terminarán inmediatamente."},
  "Revoke every dashboard session for this server? Everyone, including you, will be signed out and must use a new login code.": {fr:"Révoquer toutes les sessions du tableau de bord de ce serveur ? Tout le monde, vous compris, sera déconnecté et devra utiliser un nouveau code.",pt:"Revogar todas as sessões do painel deste servidor? Todos, incluindo o proprietário, terão a sessão terminada e precisarão de um novo código.",es:"¿Revocar todas las sesiones del panel de este servidor? Todos, incluido tú, cerrarán sesión y deberán usar un código nuevo."},
  "The server owner has not granted you access to this dashboard.": {fr:"Le propriétaire du serveur ne vous a pas accordé l’accès à ce tableau de bord.",pt:"O proprietário do servidor não lhe concedeu acesso a este painel.",es:"El propietario del servidor no te ha concedido acceso a este panel."},
  "The server owner has revoked your dashboard access.": {fr:"Le propriétaire du serveur a révoqué votre accès au tableau de bord.",pt:"O proprietário do servidor revogou o seu acesso ao painel.",es:"El propietario del servidor ha revocado tu acceso al panel."},
  "Only the server owner can manage dashboard access.": {fr:"Seul le propriétaire du serveur peut gérer l’accès au tableau de bord.",pt:"Apenas o proprietário do servidor pode gerir o acesso ao painel.",es:"Solo el propietario del servidor puede gestionar el acceso al panel."},
  "Enter a valid Stoat user ID.": {fr:"Saisissez un identifiant utilisateur Stoat valide.",pt:"Introduza um ID de utilizador Stoat válido.",es:"Introduce un ID de usuario de Stoat válido."},
  "The server owner always has dashboard access.": {fr:"Le propriétaire du serveur a toujours accès au tableau de bord.",pt:"O proprietário do servidor tem sempre acesso ao painel.",es:"El propietario del servidor siempre tiene acceso al panel."},
  "Choose a non-bot member of this server.": {fr:"Choisissez un membre humain de ce serveur.",pt:"Escolha um membro não-bot deste servidor.",es:"Elige un miembro que no sea un bot de este servidor."},
  "The server owner cannot revoke their own access.": {fr:"Le propriétaire du serveur ne peut pas révoquer son propre accès.",pt:"O proprietário do servidor não pode revogar o próprio acesso.",es:"El propietario del servidor no puede revocar su propio acceso."},
  "That user does not have dashboard access.": {fr:"Cet utilisateur n’a pas accès au tableau de bord.",pt:"Esse utilizador não tem acesso ao painel.",es:"Ese usuario no tiene acceso al panel."},
  "That user is not blocked from the dashboard.": {fr:"Cet utilisateur n’est pas bloqué du tableau de bord.",pt:"Esse utilizador não está bloqueado no painel.",es:"Ese usuario no está bloqueado en el panel."},
  "Dashboard unavailable": {fr:"Tableau de bord indisponible",pt:"Painel indisponível",es:"Panel no disponible"},
  "We could not open the control room.": {fr:"Nous n’avons pas pu ouvrir le centre de contrôle.",pt:"Não foi possível abrir a sala de controlo.",es:"No se pudo abrir la sala de control."},
  "The dashboard could not be loaded.": {fr:"Le tableau de bord n’a pas pu être chargé.",pt:"Não foi possível carregar o painel.",es:"No se pudo cargar el panel."},
  "Try again": {fr:"Réessayer",pt:"Tentar novamente",es:"Intentar de nuevo"},
  "hierarchy blocked": {fr:"hiérarchie bloquée",pt:"hierarquia bloqueada",es:"jerarquía bloqueada"},
  "Approved": {fr:"Approuvé",pt:"Aprovado",es:"Aprobado"},
  "Denied": {fr:"Refusé",pt:"Recusado",es:"Denegado"},
  "Revoked": {fr:"Révoqué",pt:"Revogado",es:"Revocado"},
  "Pending": {fr:"En attente",pt:"Pendente",es:"Pendiente"},
  "members": {fr:"membres",pt:"membros",es:"miembros"},
  "active": {fr:"actifs",pt:"ativos",es:"activos"},
  "messages today": {fr:"messages aujourd’hui",pt:"mensagens hoje",es:"mensajes hoy"},
  "Latest": {fr:"Derniers",pt:"Mais recentes",es:"Últimos"},
  "event": {fr:"événement",pt:"evento",es:"evento"},
  "events": {fr:"événements",pt:"eventos",es:"eventos"},
  "User": {fr:"Utilisateur",pt:"Utilizador",es:"Usuario"},
  "Actor": {fr:"Auteur",pt:"Autor",es:"Autor"},
  "No bot activity has been recorded yet.": {fr:"Aucune activité du bot n’a encore été enregistrée.",pt:"Ainda não foi registada atividade do bot.",es:"Aún no se ha registrado actividad del bot."},
  "Option": {fr:"Option",pt:"Opção",es:"Opción"},
  "voter": {fr:"votant",pt:"votante",es:"votante"},
  "voters": {fr:"votants",pt:"votantes",es:"votantes"},
  "posts": {fr:"publication",pt:"publica",es:"publica"},
  "closes": {fr:"clôture",pt:"fecha",es:"cierra"},
};

export function normalizeAppLocale(value: unknown): AppLocale {
  return value === "fr" || value === "pt" || value === "es" ? value : "en";
}

/* ------------------------------------------------------------------ dictionaries */
// The complete website dictionaries live in /i18n/<locale>.json (generated by i18n/build.cjs) and are
// fetched only when a non-English language is selected, so the English bundle stays small. `P` above
// keeps the original hand-written entries and remains the first fallback.
const DICTIONARY_VERSION = "44343534b6";
type PatternEntry = { regex: RegExp; target: string };
type Dictionary = { exact: Map<string, string>; patterns: PatternEntry[] };
const dictionaries = new Map<AppLocale, Dictionary>();
const dictionaryRequests = new Map<AppLocale, Promise<void>>();
let dictionaryRevision = 0;

function compileDictionary(entries: Record<string, string>): Dictionary {
  const exact = new Map<string, string>();
  const patterns: PatternEntry[] = [];
  for (const [source, target] of Object.entries(entries)) {
    if (!/\{=?\d+\}/.test(source)) { exact.set(source, target); continue; }
    const body = source.split(/(\{=?\d+\})/).map((part) => /^\{=?\d+\}$/.test(part) ? "([\\s\\S]+?)" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("");
    patterns.push({ regex: new RegExp(`^${body}$`), target: target });
  }
  patterns.sort((a, b) => b.regex.source.length - a.regex.source.length);
  return { exact, patterns };
}

/** Translates a pattern placeholder: the whole value if known, otherwise each "A / B", "A · B" or "A, B" segment on its own. */
function translateCapture(locale: AppLocale, value: string, depth: number): string {
  const whole = lookup(locale, value, depth + 1);
  if (whole !== null) return whole;
  if (depth > 2 || !/ [/·] |, /.test(value)) return value;
  return value.split(/( [/·] |, )/).map((part, index) => (index % 2 ? part : lookup(locale, part, depth + 1) ?? part)).join("");
}

function applyPattern(locale: AppLocale, entry: PatternEntry, source: string, depth: number): string | null {
  const match = entry.regex.exec(source);
  if (!match) return null;
  // {=0} placeholders carry user-supplied text (a server name, a tag) and are inserted verbatim.
  return entry.target.replace(/\{(=?)(\d+)\}/g, (_whole, verbatim: string, index: string) => { const value = match[Number(index) + 1] ?? ""; return verbatim ? value : translateCapture(locale, value, depth); });
}

function loadDictionary(locale: AppLocale): Promise<void> {
  if (locale === "en") return Promise.resolve();
  const existing = dictionaryRequests.get(locale);
  if (existing) return existing;
  const request = fetch(`/i18n/${locale}.json?v=${DICTIONARY_VERSION}`, { credentials: "same-origin" })
    .then((response) => (response.ok ? response.json() : {}))
    .then((entries: Record<string, string>) => { dictionaries.set(locale, compileDictionary(entries)); dictionaryRevision += 1; notify(); })
    .catch(() => { dictionaryRequests.delete(locale); });
  dictionaryRequests.set(locale, request);
  return request;
}

function lookup(locale: AppLocale, source: string, depth = 0): string | null {
  const dictionary = dictionaries.get(locale as AppLocale);
  const hit = dictionary?.exact.get(source);
  if (hit !== undefined) return hit;
  const legacy = P[source]?.[locale as "fr" | "pt" | "es"];
  if (legacy) return legacy;
  if (dictionary && depth < 3) {
    for (const entry of dictionary.patterns) {
      const translated = applyPattern(locale, entry, source, depth);
      if (translated !== null) return translated;
    }
    // "Protection / Automod" or "Reasons · Notes · Evidence": translate only when every segment is known.
    if (dictionary && / [/·] /.test(source)) {
      let complete = true;
      const joined = source.split(/( [/·] )/).map((part, index) => {
        if (index % 2) return part;
        const hit = lookup(locale, part, depth + 1);
        if (hit === null && /[A-Za-z]{2}/.test(part)) complete = false;
        return hit ?? part;
      }).join("");
      if (complete) return joined;
    }
  }
  return null;
}

export function tr(locale: AppLocale, source: string): string {
  if (locale === "en") return source;
  return lookup(locale, source.replace(/\s+/g, " ").trim()) ?? source;
}

/* ------------------------------------------------------------------ shared locale state */
const STORAGE_KEY = "stoat.locale";
const listeners = new Set<() => void>();
let persistedLocale: AppLocale | null | undefined;
let pageDefaultLocale: AppLocale | null = null;

function notify() { listeners.forEach((listener) => listener()); }
function readPersisted(): AppLocale | null {
  if (persistedLocale !== undefined) return persistedLocale;
  try { const stored = window.localStorage.getItem(STORAGE_KEY); persistedLocale = stored ? normalizeAppLocale(stored) : null; } catch { persistedLocale = null; }
  return persistedLocale;
}
function currentLocale(): AppLocale { return readPersisted() ?? pageDefaultLocale ?? "en"; }
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY) { persistedLocale = undefined; notify(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

export function setSiteLocale(locale: AppLocale) {
  persistedLocale = locale;
  try { window.localStorage.setItem(STORAGE_KEY, locale); } catch { /* storage unavailable: keep the choice for this page view */ }
  notify();
}

/** The visitor's chosen language. `defaultLocale` (for example a server's configured language) applies until the visitor chooses one. */
export function useSiteLocale(defaultLocale?: AppLocale | null): [AppLocale, (locale: AppLocale) => void] {
  useEffect(() => {
    if (!defaultLocale) return undefined;
    pageDefaultLocale = defaultLocale;
    notify();
    return () => { if (pageDefaultLocale === defaultLocale) { pageDefaultLocale = null; notify(); } };
  }, [defaultLocale]);
  const locale = useSyncExternalStore(subscribe, currentLocale, () => "en" as AppLocale);
  useSyncExternalStore(subscribe, () => dictionaryRevision, () => 0);
  return [locale, setSiteLocale];
}

/* ------------------------------------------------------------------ DOM translation */
const originals = new WeakMap<Node, string>();
const attributeOriginals = new WeakMap<Element, Map<string, string>>();
const translatedValues = new WeakMap<Node, string>();
const translatedAttributeValues = new WeakMap<Element, Map<string, string>>();
const SKIPPED_ELEMENTS = "[data-no-translate],code,pre,kbd,samp,script,style,textarea,noscript";
const TRANSLATED_ATTRIBUTES = ["placeholder", "aria-label", "title", "alt"];

/* Dates are formatted in English by the pages (for example "3 Oct 2026" or "04 Oct, 14:05"); month names are localised here. */
const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTHS: Record<"fr" | "pt" | "es", { long: string[]; short: string[] }> = {
  fr: { long: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"], short: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."] },
  pt: { long: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"], short: ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."] },
  es: { long: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"], short: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] },
};
const DATE_PATTERN = /\b(\d{1,2}) (Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b(?: (\d{4})\b)?/g;

function localizeDates(locale: "fr" | "pt" | "es", text: string): string {
  if (!/\d (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/.test(text)) return text;
  return text.replace(DATE_PATTERN, (_whole, day: string, month: string, year: string | undefined) => {
    const index = MONTH_KEYS.indexOf(month.slice(0, 3).toLowerCase());
    if (index < 0) return _whole;
    const long = month.length > 3 && !(month === "Sept");
    const names = MONTHS[locale];
    const name = long ? names.long[index] : names.short[index];
    const joiner = locale === "fr" || !long ? " " : " de ";
    const yearJoiner = locale === "fr" || !long ? " " : " de ";
    return `${day}${joiner}${name}${year ? yearJoiner + year : ""}`;
  });
}

const UNITS: Record<"fr" | "pt" | "es", { sec: string; min: string; hr: string; days: string; day: string }> = {
  fr: { sec: "s", min: "min", hr: "h", days: "jours", day: "jour" },
  pt: { sec: "s", min: "min", hr: "h", days: "dias", day: "dia" },
  es: { sec: "s", min: "min", hr: "h", days: "días", day: "día" },
};

/** Durations such as "2 hr 5 min" or "3 days 4 hr" are built by the pages in English. */
function localizeDurations(locale: "fr" | "pt" | "es", text: string): string {
  if (!/\d (?:sec|min|hr|days?)\b/.test(text)) return text;
  const units = UNITS[locale];
  return text.replace(/(<?\d+) (sec|min|hr|days?)\b/g, (_whole, amount: string, unit: string) => {
    if (unit === "sec") return `${amount} ${units.sec}`;
    if (unit === "min") return `${amount} ${units.min}`;
    if (unit === "hr") return `${amount} ${units.hr}`;
    return `${amount} ${amount === "1" ? units.day : units.days}`;
  });
}

function finishText(locale: "fr" | "pt" | "es", text: string): string { return localizeDurations(locale, localizeDates(locale, text)); }

function translatedText(locale: AppLocale, source: string): string {
  if (locale === "en") return source;
  const normalized = source.replace(/\s+/g, " ");
  const direct = lookup(locale, normalized);
  if (direct !== null) return finishText(locale, direct);
  // Sentence fragments often carry leading or trailing punctuation from the surrounding markup (". Membership totals…").
  const leading = /^[\s.,;:·•—–|/-]+/.exec(normalized)?.[0] ?? "";
  if (leading && leading.length < normalized.length) {
    const inner = lookup(locale, normalized.slice(leading.length));
    if (inner !== null) return finishText(locale, leading + inner);
  }
  const edges = /^([\s.,;:·•—–|/-]*)([\s\S]*?)([\s.,;:·•—–|/-]*)$/.exec(normalized);
  if (edges && (edges[1] || edges[3]) && edges[2]) {
    const inner = lookup(locale, edges[2]);
    if (inner !== null) return finishText(locale, edges[1] + inner + edges[3]);
  }
  return finishText(locale, source);
}

function translateTree(locale: AppLocale, root: Node) {
  const host = root instanceof Element ? root : root.parentElement;
  if (host && host.closest(SKIPPED_ELEMENTS)) return;
  if (root.nodeType === Node.TEXT_NODE) {
    const current = root.textContent ?? "";
    const lastTranslated = translatedValues.get(root);
    const source = !originals.has(root) || (lastTranslated !== undefined && current !== lastTranslated) ? current : originals.get(root) ?? current;
    originals.set(root, source);
    const leading = source.match(/^\s*/)?.[0] || "";
    const trailing = source.match(/\s*$/)?.[0] || "";
    const core = source.slice(leading.length, source.length - trailing.length);
    if (core) {
      const next = leading + translatedText(locale, core) + trailing;
      translatedValues.set(root, next);
      if (root.textContent !== next) root.textContent = next;
    }
    return;
  }
  if (root instanceof Element) {
    for (const attribute of TRANSLATED_ATTRIBUTES) {
      const current = root.getAttribute(attribute);
      if (current === null) continue;
      let values = attributeOriginals.get(root);
      if (!values) { values = new Map(); attributeOriginals.set(root, values); }
      let translated = translatedAttributeValues.get(root);
      if (!translated) { translated = new Map(); translatedAttributeValues.set(root, translated); }
      const lastTranslated = translated.get(attribute);
      const source = !values.has(attribute) || (lastTranslated !== undefined && current !== lastTranslated) ? current : values.get(attribute) ?? current;
      values.set(attribute, source);
      const next = translatedText(locale, source);
      translated.set(attribute, next);
      if (current !== next) root.setAttribute(attribute, next);
    }
  }
  root.childNodes.forEach((child) => translateTree(locale, child));
}

let originalTitle: string | null = null;
let lastTranslatedTitle: string | null = null;
function translateTitle(locale: AppLocale) {
  const current = document.title;
  if (originalTitle === null || (lastTranslatedTitle !== null && current !== lastTranslatedTitle)) originalTitle = current;
  const next = translatedText(locale, originalTitle);
  lastTranslatedTitle = next;
  if (document.title !== next) document.title = next;
}

export function useDocumentTranslations(locale: AppLocale) {
  const revision = useSyncExternalStore(subscribe, () => dictionaryRevision, () => 0);
  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en-GB" : locale;
    if (locale !== "en") void loadDictionary(locale);
    translateTree(locale, document.body);
    translateTitle(locale);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") translateTree(locale, mutation.target);
        mutation.addedNodes.forEach((node) => translateTree(locale, node));
      }
      translateTitle(locale);
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    const title = document.querySelector("title");
    if (title) observer.observe(title, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [locale, revision]);
}

/** Mounted once in the root layout so every page, including static documentation, follows the visitor's language. */
export function SiteTranslator() {
  const [locale] = useSiteLocale();
  useDocumentTranslations(locale);
  return null;
}

/** Floating language control available on every page (hidden where a page already shows its own selector). */
export function LanguageToggle() {
  const [locale, setLocale] = useSiteLocale();
  return <label className="language-toggle"><span aria-hidden="true">🌐</span><select aria-label={tr(locale, "Choose language")} value={locale} onChange={(event) => setLocale(normalizeAppLocale(event.target.value))}>{APP_LANGUAGES.map((language) => <option value={language.code} key={language.code}>{language.label}</option>)}</select></label>;
}

export function LocaleSelector({ locale, onChange, label }: { locale?: AppLocale; onChange?: (locale: AppLocale) => void; label?: string }) {
  const [shared, setShared] = useSiteLocale();
  const active = locale ?? shared;
  const change = (next: AppLocale) => { setShared(next); onChange?.(next); };
  return <div className="page-language-selector"><label>{label || tr(active, "Language")}<select aria-label={tr(active, "Choose language")} value={active} onChange={(event) => change(normalizeAppLocale(event.target.value))}>{APP_LANGUAGES.map((language) => <option value={language.code} key={language.code}>{language.label}</option>)}</select></label></div>;
}
