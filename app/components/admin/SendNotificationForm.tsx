/**
 * Send Notification Form (Admin)
 *
 * Complete form for admins to send notifications to users.
 * Includes type selection, slot details, recipient selection, preview, and confirmation.
 */

import { useState } from 'react';
import useSendNotification from '~/hooks/useSendNotification';
import useUsers from '~/hooks/useUsers';
import useAvailableSlots from '~/hooks/useAvailableSlots';
import useSlotRecipients from '~/hooks/useSlotRecipients';
import type { NotificationType } from '~/types/notification';
import type { SendNotificationFormState, SendNotificationFormErrors } from '~/types/admin';

export default function SendNotificationForm() {
  // Form state
  const [formState, setFormState] = useState<SendNotificationFormState>({
    type: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    recipientIds: [],
    slotId: '',
  });

  const [errors, setErrors] = useState<SendNotificationFormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Hooks
  const { users, isLoadingUsers, errorUsers } = useUsers();
  const { slots, isLoadingSlots, errorSlots } = useAvailableSlots();
  const { recipients: slotRecipients } = useSlotRecipients(formState.slotId);
  const { sendNotification, isSending, deliveryReport, sendError } = useSendNotification({
    onSuccess: () => {
      setShowConfirmation(false);
      setShowPreview(false);
      setShowResult(true);
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`);
    },
  });

  // Validation
  const validateForm = (): boolean => {
    const newErrors: SendNotificationFormErrors = {};

    if (!formState.type) {
      newErrors.type = 'Type de notification requis';
    }

    if (!formState.date) {
      newErrors.date = 'Date requise';
    } else {
      const selectedDate = new Date(formState.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'La date ne peut pas être dans le passé';
      }
    }

    if (!formState.startTime) {
      newErrors.startTime = 'Heure de début requise';
    }

    if (!formState.endTime) {
      newErrors.endTime = 'Heure de fin requise';
    }

    if (formState.startTime && formState.endTime && formState.startTime >= formState.endTime) {
      newErrors.endTime = "L'heure de fin doit être après l'heure de début";
    }

    if (!formState.location.trim()) {
      newErrors.location = 'Lieu requis';
    }

    // Type-specific validation
    if (formState.type === 'SLOT_PROPOSAL') {
      if (formState.recipientIds.length === 0) {
        newErrors.recipientIds = 'Sélectionnez au moins un destinataire';
      } else if (formState.recipientIds.length > 10) {
        newErrors.recipientIds = 'Maximum 10 destinataires';
      }
    }

    if (formState.type === 'SLOT_CANCELLED' && !formState.slotId) {
      newErrors.slotId = 'Sélectionnez un créneau à annuler';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleConfirm = () => {
    setShowPreview(false);
    setShowConfirmation(true);
  };

  const handleSend = () => {
    sendNotification({
      type: formState.type as NotificationType,
      slot: {
        date: formState.date,
        startTime: formState.startTime,
        endTime: formState.endTime,
        location: formState.location,
        description: formState.description || undefined,
      },
      recipientIds: formState.type === 'SLOT_PROPOSAL' ? formState.recipientIds : undefined,
      slotId: formState.type === 'SLOT_CANCELLED' ? formState.slotId : undefined,
    });
  };

  const resetForm = () => {
    setFormState({
      type: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      recipientIds: [],
      slotId: '',
    });
    setErrors({});
    setShowResult(false);
  };

  // Get recipient count for preview
  const getRecipientCount = () => {
    if (formState.type === 'SLOT_PROPOSAL') {
      return formState.recipientIds.length;
    }
    if (formState.type === 'SLOT_AVAILABLE') {
      return users.filter((u) => u.availability_alerts_enabled).length;
    }
    if (formState.type === 'SLOT_CANCELLED') {
      return slotRecipients.length;
    }
    return 0;
  };

  // Get recipient emails for preview
  const getRecipientEmails = () => {
    if (formState.type === 'SLOT_PROPOSAL') {
      return users.filter((u) => formState.recipientIds.includes(u.id)).map((u) => u.email);
    }
    if (formState.type === 'SLOT_AVAILABLE') {
      return users.filter((u) => u.availability_alerts_enabled).map((u) => u.email);
    }
    if (formState.type === 'SLOT_CANCELLED') {
      return slotRecipients.map((r) => r.email);
    }
    return [];
  };

  // Get notification title based on type
  const getNotificationTitle = () => {
    switch (formState.type) {
      case 'SLOT_PROPOSAL':
        return 'Proposition de créneau';
      case 'SLOT_AVAILABLE':
        return 'Créneau disponible';
      case 'SLOT_CANCELLED':
        return 'Créneau annulé';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyer une notification</h2>

      {/* Debug: Show errors if any */}
      {errorUsers && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            <strong>Erreur lors du chargement des utilisateurs:</strong>{' '}
            {errorUsers instanceof Error ? errorUsers.message : 'Erreur inconnue'}
          </p>
          <p className="text-xs text-red-600 mt-2">
            Assurez-vous que la migration de la base de données a été appliquée (colonne availability_alerts_enabled).
          </p>
        </div>
      )}
      {errorSlots && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            <strong>Erreur lors du chargement des créneaux:</strong>{' '}
            {errorSlots instanceof Error ? errorSlots.message : 'Erreur inconnue'}
          </p>
        </div>
      )}

      {!showResult ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de notification *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="SLOT_PROPOSAL"
                  checked={formState.type === 'SLOT_PROPOSAL'}
                  onChange={(e) => setFormState({ ...formState, type: e.target.value as NotificationType | '' })}
                  className="mr-2"
                />
                <span className="text-sm text-black">
                  <strong>Proposition de créneau</strong> - Proposer un créneau à des utilisateurs
                  spécifiques (max 10)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="SLOT_AVAILABLE"
                  checked={formState.type === 'SLOT_AVAILABLE'}
                  onChange={(e) => setFormState({ ...formState, type: e.target.value as NotificationType | '' })}
                  className="mr-2"
                />
                <span className="text-sm text-black">
                <strong>Créneau disponible</strong> - Annoncer un créneau aux utilisateurs avec
                  alertes activées
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="SLOT_CANCELLED"
                  checked={formState.type === 'SLOT_CANCELLED'}
                  onChange={(e) => setFormState({ ...formState, type: e.target.value as NotificationType | '' })}
                  className="mr-2"
                />
                <span className="text-sm text-black">
                  <strong>Créneau annulé</strong> - Annuler un créneau pour les utilisateurs
                  inscrits
                </span>
              </label>
            </div>
            {errors.type && <p className="mt-2 text-sm text-red-600">{errors.type}</p>}
          </div>

          {/* Recipient Selection (SLOT_PROPOSAL) */}
          {formState.type === 'SLOT_PROPOSAL' && (
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Destinataires * ({formState.recipientIds.length}/10)
              </label>
              {isLoadingUsers ? (
                <p className="text-sm text-gray-500">Chargement des utilisateurs...</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded p-3">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formState.recipientIds.includes(user.id)}
                        onChange={(e) => {
                          const newRecipientIds = e.target.checked
                            ? [...formState.recipientIds, user.id]
                            : formState.recipientIds.filter((id) => id !== user.id);
                          setFormState({ ...formState, recipientIds: newRecipientIds });
                        }}
                        disabled={
                          !formState.recipientIds.includes(user.id) &&
                          formState.recipientIds.length >= 10
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-black">
                        {user.email}
                        {user.role === 'admin' && (
                          <span className="ml-2 text-xs text-blue-600">(Admin)</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {errors.recipientIds && (
                <p className="mt-2 text-sm text-red-600">{errors.recipientIds}</p>
              )}
            </div>
          )}

          {/* Slot Selection (SLOT_CANCELLED) */}
          {formState.type === 'SLOT_CANCELLED' && (
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Créneau à annuler *
              </label>
              {isLoadingSlots ? (
                <p className="text-sm text-gray-500">Chargement des créneaux...</p>
              ) : (
                <>
                  <select
                    value={formState.slotId}
                    onChange={(e) => setFormState({ ...formState, slotId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Sélectionnez un créneau</option>
                    {slots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.label} ({slot.recipientCount} inscrits)
                      </option>
                    ))}
                  </select>
                  {formState.slotId && (
                    <p className="mt-2 text-sm text-gray-600">
                      {slotRecipients.length} destinataire(s) seront notifiés
                    </p>
                  )}
                </>
              )}
              {errors.slotId && <p className="mt-2 text-sm text-red-600">{errors.slotId}</p>}
            </div>
          )}

          {/* Slot Details */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 text-black">Détails du créneau</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-black">Date *</label>
                <input
                  type="date"
                  value={formState.date}
                  onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-black">Début *</label>
                  <input
                    type="time"
                    value={formState.startTime}
                    onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-black">Fin *</label>
                  <input
                    type="time"
                    value={formState.endTime}
                    onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                  />
                  {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-black">Lieu *</label>
              <input
                type="text"
                value={formState.location}
                onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                placeholder="Ex: Paris 15e"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-black">
                Description (optionnel)
              </label>
              <textarea
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Ex: Prédication publique - Stand métro Commerce"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Prévisualiser
            </button>
          </div>
        </form>
      ) : (
        // Result Screen
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notification envoyée !</h3>
            {deliveryReport && (
              <div className="mt-4 text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Total de destinataires:</strong> {deliveryReport.totalRecipients}
                </p>
                <p>
                  <strong>Notifications push envoyées:</strong>{' '}
                  {deliveryReport.pushNotificationsSent}
                </p>
                {deliveryReport.failedDeliveries > 0 && (
                  <p className="text-red-600">
                    <strong>Échecs:</strong> {deliveryReport.failedDeliveries}
                  </p>
                )}
              </div>
            )}
            {sendError && (
              <p className="mt-4 text-sm text-red-600">Erreur: {sendError.message}</p>
            )}
            <div className="mt-6 flex justify-center space-x-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Envoyer une autre notification
              </button>
              <a
                href="/admin/history"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Voir l'historique
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Prévisualisation de la notification
              </h3>

              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                    {formState.type}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {getNotificationTitle()}
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong className="text-black">Date:</strong> {formState.date}
                  </p>
                  <p>
                    <strong className="text-black">Horaire:</strong> {formState.startTime} - {formState.endTime}
                  </p>
                  <p>
                    <strong className="text-black">Lieu:</strong> {formState.location}
                  </p>
                  {formState.description && (
                    <p>
                      <strong className="text-black">Description:</strong> {formState.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Destinataires ({getRecipientCount()})
                </h4>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-3">
                  {getRecipientEmails().slice(0, 10).map((email, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {email}
                    </p>
                  ))}
                  {getRecipientEmails().length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                      et {getRecipientEmails().length - 10} autres...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Modifier
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer l'envoi</h3>
              <p className="text-sm text-gray-600 mb-6">
                Vous allez envoyer cette notification à <strong>{getRecipientCount()}</strong>{' '}
                utilisateur(s). Voulez-vous continuer ?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSending}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSending ? 'Envoi en cours...' : "Confirmer l'envoi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
