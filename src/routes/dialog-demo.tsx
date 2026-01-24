/**
 * Dialog Widgets Demo Page
 *
 * Demonstrates Modal and Toast widgets with various configurations.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ModalWidgetConfig } from '@/widgets/ModalWidget';
import { ModalWidget } from '@/widgets/ModalWidget';
import { toastManager } from '@/widgets/ToastWidget';

export const Route = createFileRoute('/dialog-demo')({
  component: DialogDemoPage,
});

function DialogDemoPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');
  const [modalWithActions, setModalWithActions] = useState(false);

  const basicModalConfig: ModalWidgetConfig = {
    id: 'demo-modal',
    type: 'Modal',
    title: 'Basic Modal',
    description: 'This is a basic modal dialog example.',
    size: modalSize,
  };

  const modalWithActionsConfig: ModalWidgetConfig = {
    id: 'modal-with-actions',
    type: 'Modal',
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed with this action?',
    size: 'md',
    actions: [
      {
        id: 'cancel',
        label: 'Cancel',
        variant: 'outline',
        actionId: 'cancel',
      },
      {
        id: 'confirm',
        label: 'Confirm',
        variant: 'default',
        actionId: 'confirm',
      },
    ],
  };

  const handleModalAction = (actionId: string) => {
    if (actionId === 'confirm') {
      toastManager.success('Action confirmed!');
      setModalWithActions(false);
    } else if (actionId === 'cancel') {
      toastManager.info('Action cancelled');
      setModalWithActions(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Dialog Widgets Demo</h1>

      {/* Modal Demos */}
      <Card>
        <CardHeader>
          <CardTitle>Modal Widget</CardTitle>
          <CardDescription>
            Click the buttons below to see different modal configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => {
                setModalSize('sm');
                setModalOpen(true);
              }}
            >
              Small Modal
            </Button>
            <Button
              onClick={() => {
                setModalSize('md');
                setModalOpen(true);
              }}
            >
              Medium Modal
            </Button>
            <Button
              onClick={() => {
                setModalSize('lg');
                setModalOpen(true);
              }}
            >
              Large Modal
            </Button>
            <Button
              onClick={() => {
                setModalSize('xl');
                setModalOpen(true);
              }}
            >
              Extra Large Modal
            </Button>
            <Button
              onClick={() => {
                setModalSize('full');
                setModalOpen(true);
              }}
            >
              Full Screen Modal
            </Button>
          </div>

          <div>
            <Button onClick={() => setModalWithActions(true)} variant="secondary">
              Modal with Actions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Toast Demos */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>
            Click the buttons below to trigger different toast notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => toastManager.success('Success!', 'This is a success message')}
              variant="default"
            >
              Success Toast
            </Button>
            <Button
              onClick={() => toastManager.error('Error!', 'This is an error message')}
              variant="destructive"
            >
              Error Toast
            </Button>
            <Button
              onClick={() => toastManager.warning('Warning!', 'This is a warning message')}
              variant="outline"
            >
              Warning Toast
            </Button>
            <Button
              onClick={() => toastManager.info('Info', 'This is an info message')}
              variant="secondary"
            >
              Info Toast
            </Button>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => {
                toastManager.show({
                  message: 'Action Required',
                  variant: 'info',
                  description: 'You have a pending action',
                  action: {
                    label: 'View',
                    actionId: 'view',
                  },
                  onActionClick: () => {
                    toastManager.success('Action clicked!');
                  },
                });
              }}
              variant="outline"
            >
              Toast with Action
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Components */}
      <ModalWidget
        config={basicModalConfig}
        bindings={{ isOpen: modalOpen }}
        events={{ onClose: () => setModalOpen(false) }}
      >
        <div className="space-y-4">
          <p>This is a {modalSize} modal.</p>
          <p>You can click the backdrop or press ESC to close this modal.</p>
        </div>
      </ModalWidget>

      <ModalWidget
        config={modalWithActionsConfig}
        bindings={{ isOpen: modalWithActions }}
        events={{
          onClose: () => setModalWithActions(false),
          onActionClick: handleModalAction,
        }}
      >
        <div className="py-4">
          <p>This modal demonstrates action buttons in the footer.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Click "Confirm" to proceed or "Cancel" to dismiss.
          </p>
        </div>
      </ModalWidget>
    </div>
  );
}
