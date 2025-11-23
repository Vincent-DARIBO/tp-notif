import { useQuery } from "@tanstack/react-query";
import { NotificationService } from "../services/NotificationService";

/**
 * Hook React Query pour gérer les notifications
 *
 * Responsabilités:
 * - Récupérer la liste des notifications via NotificationService
 * - Gérer le cache et la mise à jour automatique des données (React Query)
 * - Exposer l'état de chargement et les erreurs
 * - Fournir une fonction de refetch pour actualiser manuellement
 *
 * Architecture:
 * Ce hook utilise React Query pour :
 * - Automatiser le cache des notifications
 * - Éviter les requêtes redondantes
 * - Gérer le background refetching
 * - Synchroniser les données entre composants
 *
 * Cache Strategy:
 * - queryKey: ["notifications"] - Identifiant unique pour le cache
 * - staleTime: Non défini = données considérées obsolètes immédiatement
 * - cacheTime: Par défaut 5 minutes
 * - refetchOnWindowFocus: true par défaut (rafraîchit quand l'utilisateur revient sur l'onglet)
 *
 * @returns Objet contenant les notifications et les états associés
 *
 * @example
 * ```tsx
 * function NotificationsList() {
 *   const {
 *     notifications,
 *     isLoadingNotifications,
 *     errorNotifications,
 *     refetchNotifications
 *   } = useNotifications();
 *
 *   if (isLoadingNotifications) return <Spinner />;
 *   if (errorNotifications) return <Error message={errorNotifications.message} />;
 *
 *   return (
 *     <div>
 *       <button onClick={() => refetchNotifications()}>Actualiser</button>
 *       {notifications?.map(notif => <NotificationCard key={notif.id} {...notif} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export default function useNotifications() {
  /**
   * Configuration React Query
   *
   * - data: Liste des notifications retournée par le service
   * - isLoading: true pendant la première requête (pas pour les refetch)
   * - error: Erreur capturée si la requête échoue
   * - refetch: Fonction pour forcer une nouvelle requête
   */
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationService.getNotifications(),
  });

  /**
   * Retour avec noms explicites suivant les conventions du projet
   *
   * Nomenclature:
   * - notifications: Les données (pas "data")
   * - isLoadingNotifications: État de chargement préfixé
   * - errorNotifications: Erreur préfixée
   * - refetchNotifications: Fonction de refetch préfixée
   */
  return {
    notifications: data,
    isLoadingNotifications: isLoading,
    errorNotifications: error,
    refetchNotifications: refetch,
  };
}
