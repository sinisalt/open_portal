/**
 * Modal Workflows Demo Page
 *
 * Demonstrates ModalPageWidget and WizardWidget with various configurations.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModalPageWidget } from '@/widgets/ModalPageWidget';
import type { ModalPageWidgetConfig } from '@/widgets/ModalPageWidget/types';
import { toastManager } from '@/widgets/ToastWidget';
import { WizardWidget } from '@/widgets/WizardWidget';
import type { WizardWidgetConfig } from '@/widgets/WizardWidget/types';

export const Route = createFileRoute('/modal-workflows-demo')({
  component: ModalWorkflowsDemoPage,
});

function ModalWorkflowsDemoPage() {
  const [modalPageOpen, setModalPageOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);
  const [wizardData, setWizardData] = useState<Record<string, unknown> | null>(null);

  // Modal Page Configuration - Image Picker Example
  const imagePickerConfig: ModalPageWidgetConfig = {
    id: 'image-picker-modal',
    type: 'ModalPage',
    title: 'Select an Image',
    description: 'Choose an image from the gallery',
    size: 'lg',
    actions: [
      {
        id: 'cancel',
        label: 'Cancel',
        variant: 'outline',
        actionId: 'cancel',
      },
      {
        id: 'select',
        label: 'Select Image',
        variant: 'default',
        actionId: 'submit',
      },
    ],
    pageConfig: {
      id: 'image-gallery-page',
      type: 'Page',
      widgets: [
        {
          id: 'gallery-grid',
          type: 'Grid',
          columns: 3,
          gap: 'md',
          widgets: [
            {
              id: 'card1',
              type: 'Card',
              title: 'Mountain View',
              description: '1920x1080',
            },
            {
              id: 'card2',
              type: 'Card',
              title: 'Ocean Sunset',
              description: '1920x1080',
            },
            {
              id: 'card3',
              type: 'Card',
              title: 'Forest Path',
              description: '1920x1080',
            },
          ],
        },
      ],
    },
  };

  // Wizard Configuration - User Onboarding Example
  const onboardingWizardConfig: WizardWidgetConfig = {
    id: 'onboarding-wizard',
    type: 'Wizard',
    title: 'Welcome to OpenPortal',
    description: 'Complete your profile setup',
    size: 'lg',
    showProgress: true,
    progressStyle: 'numbers',
    allowJump: false,
    steps: [
      {
        id: 'step1',
        label: 'Personal Information',
        description: 'Tell us about yourself',
        widgets: [
          {
            id: 'firstName',
            type: 'TextInput',
            label: 'First Name',
            placeholder: 'Enter your first name',
            required: true,
          },
          {
            id: 'lastName',
            type: 'TextInput',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            required: true,
          },
          {
            id: 'email',
            type: 'TextInput',
            label: 'Email',
            placeholder: 'Enter your email',
            required: true,
          },
        ],
        validate: data => {
          if (!data.firstName || !data.lastName || !data.email) {
            return 'All fields are required';
          }
          return true;
        },
      },
      {
        id: 'step2',
        label: 'Preferences',
        description: 'Set your preferences',
        widgets: [
          {
            id: 'newsletter',
            type: 'Checkbox',
            label: 'Subscribe to newsletter',
          },
          {
            id: 'notifications',
            type: 'Checkbox',
            label: 'Enable notifications',
          },
        ],
      },
      {
        id: 'step3',
        label: 'Confirmation',
        description: 'Review and confirm your information',
        widgets: [
          {
            id: 'terms',
            type: 'Checkbox',
            label: 'I agree to the terms and conditions',
            required: true,
          },
        ],
        validate: data => {
          if (!data.terms) {
            return 'You must agree to the terms and conditions';
          }
          return true;
        },
      },
    ],
  };

  const handleModalPageSubmit = (data: Record<string, unknown>) => {
    setSelectedItem(data);
    toastManager.success('Image Selected', 'Your selection has been saved');
    setModalPageOpen(false);
  };

  const handleWizardComplete = (data: Record<string, unknown>) => {
    setWizardData(data);
    toastManager.success('Onboarding Complete!', 'Welcome to OpenPortal');
    setWizardOpen(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Modal Workflows Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating modal page system, data passing, and multi-step wizards
        </p>
      </div>

      {/* Modal Page Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Modal Page Widget</CardTitle>
          <CardDescription>
            Render full page configurations inside modals with input/output data flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={() => setModalPageOpen(true)}>Open Image Picker Modal</Button>
            {selectedItem && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm font-medium">Selected Item:</p>
                <pre className="text-xs mt-2">{JSON.stringify(selectedItem, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Full page configuration rendering</li>
              <li>✓ Input data passing via bindings</li>
              <li>✓ Output data return via events</li>
              <li>✓ Action buttons with data flow</li>
              <li>✓ Modal state management</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Wizard Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Wizard Widget</CardTitle>
          <CardDescription>
            Multi-step modal workflows with navigation and validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={() => setWizardOpen(true)} variant="secondary">
              Start Onboarding Wizard
            </Button>
            {wizardData && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm font-medium">Wizard Data:</p>
                <pre className="text-xs mt-2">{JSON.stringify(wizardData, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Multi-step workflow</li>
              <li>✓ Progress indicator (dots, numbers, bar)</li>
              <li>✓ Step navigation (next, previous, jump)</li>
              <li>✓ Step validation</li>
              <li>✓ Data accumulation across steps</li>
              <li>✓ Customizable labels and actions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Use Cases</CardTitle>
          <CardDescription>Common scenarios for modal workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Modal Page Widget</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Image/file picker modals</li>
                <li>• Record selector modals</li>
                <li>• Detail view modals</li>
                <li>• Confirmation dialogs with forms</li>
              </ul>
            </div>
            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Wizard Widget</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User onboarding flows</li>
                <li>• Checkout processes</li>
                <li>• Multi-step forms</li>
                <li>• Configuration wizards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
          <CardDescription>Architecture details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold">Modal Container:</span>
              <span className="text-muted-foreground ml-2">
                shadcn Dialog (built on @radix-ui/react-dialog)
              </span>
            </div>
            <div>
              <span className="font-semibold">Nested Modals:</span>
              <span className="text-muted-foreground ml-2">
                Radix Dialog supports multiple dialog layers with proper focus management
              </span>
            </div>
            <div>
              <span className="font-semibold">Data Flow:</span>
              <span className="text-muted-foreground ml-2">
                Input via bindings → Internal state management → Output via events
              </span>
            </div>
            <div>
              <span className="font-semibold">Validation:</span>
              <span className="text-muted-foreground ml-2">
                Custom validation functions per step with error display
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render Modal Page Widget */}
      <ModalPageWidget
        config={imagePickerConfig}
        bindings={{
          isOpen: modalPageOpen,
          inputData: {
            // Pass input data to modal
            category: 'landscapes',
            maxSelect: 1,
          },
        }}
        events={{
          onClose: () => setModalPageOpen(false),
          onCancel: () => setModalPageOpen(false),
          onSubmit: handleModalPageSubmit,
        }}
      />

      {/* Render Wizard Widget */}
      <WizardWidget
        config={onboardingWizardConfig}
        bindings={{
          isOpen: wizardOpen,
        }}
        events={{
          onClose: () => setWizardOpen(false),
          onCancel: () => setWizardOpen(false),
          onComplete: handleWizardComplete,
        }}
      />
    </div>
  );
}
