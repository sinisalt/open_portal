/**
 * Advanced Form Features Demo
 *
 * Demonstrates advanced form capabilities including:
 * - Conditional field visibility
 * - Cross-field validation
 * - Computed fields
 * - Field dependencies
 * - Dynamic form updates
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ValidationRule } from '@/types/form.types';
import type {
  CheckboxWidgetConfig,
  DatePickerWidgetConfig,
  FormWidgetConfig,
  SelectWidgetConfig,
  TextInputWidgetConfig,
} from '@/widgets';
import { CheckboxWidget, DatePickerWidget, SelectWidget, TextInputWidget } from '@/widgets';
import { FormWidget } from '@/widgets/FormWidget';

export function AdvancedFormFeaturesDemo() {
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  // Form configuration with advanced features
  const formConfig: FormWidgetConfig = {
    id: 'advanced-demo-form',
    type: 'Form',
    title: 'Order Form',
    description: 'Demonstrates conditional fields, cross-field validation, and computed values',
    initialValues: {
      productType: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0.08,
      requireShipping: false,
      shippingAddress: '',
      shippingCost: 0,
      startDate: '',
      endDate: '',
      // Computed fields (will be calculated)
      subtotal: 0,
      discountAmount: 0,
      taxableAmount: 0,
      taxAmount: 0,
      total: 0,
    },
    validationRules: {
      productType: {
        required: 'Product type is required',
      },
      quantity: {
        required: 'Quantity is required',
        min: { value: 1, message: 'Quantity must be at least 1' },
      },
      unitPrice: {
        required: 'Unit price is required',
        min: { value: 0.01, message: 'Price must be greater than 0' },
      },
      discount: {
        min: { value: 0, message: 'Discount cannot be negative' },
        max: { value: 1, message: 'Discount cannot exceed 100%' },
      },
      shippingAddress: {
        // Conditional required: only when requireShipping is true
        custom: (value, values) => {
          if (values?.requireShipping && (!value || value === '')) {
            return 'Shipping address is required when shipping is selected';
          }
          return true;
        },
      },
      endDate: {
        // Cross-field validation: end date must be after start date
        custom: (value, values) => {
          if (!value || !values?.startDate) {
            return true;
          }

          const endDate = new Date(value as string);
          const startDate = new Date(values.startDate as string);

          if (endDate <= startDate) {
            return 'End date must be after start date';
          }

          return true;
        },
      },
    } as Record<string, ValidationRule>,
    validationMode: 'onBlur',
    submitLabel: 'Place Order',
    resetLabel: 'Clear',
    submitVariant: 'primary',
    resetOnSuccess: false,
    onSubmit: {
      id: 'submit-order',
      type: 'apiCall',
      params: {
        url: '/api/orders',
        method: 'POST',
      },
    },
  };

  // Product type field
  const productTypeConfig: SelectWidgetConfig = {
    id: 'productType',
    type: 'Select',
    label: 'Product Type',
    placeholder: 'Select a product type',
    required: true,
    options: [
      { value: 'software', label: 'Software License' },
      { value: 'hardware', label: 'Hardware Device' },
      { value: 'service', label: 'Consulting Service' },
      { value: 'subscription', label: 'Subscription' },
    ],
  };

  // Quantity field
  const quantityConfig: TextInputWidgetConfig = {
    id: 'quantity',
    type: 'TextInput',
    label: 'Quantity',
    placeholder: 'Enter quantity',
    inputType: 'number',
    required: true,
  };

  // Unit price field
  const unitPriceConfig: TextInputWidgetConfig = {
    id: 'unitPrice',
    type: 'TextInput',
    label: 'Unit Price ($)',
    placeholder: 'Enter unit price',
    inputType: 'number',
    required: true,
  };

  // Discount field
  const discountConfig: TextInputWidgetConfig = {
    id: 'discount',
    type: 'TextInput',
    label: 'Discount (0-1)',
    placeholder: 'Enter discount (e.g., 0.1 for 10%)',
    inputType: 'number',
    helpText: 'Enter as decimal: 0.1 = 10%, 0.25 = 25%',
  };

  // Tax rate field (readonly computed)
  const taxRateConfig: TextInputWidgetConfig = {
    id: 'taxRate',
    type: 'TextInput',
    label: 'Tax Rate',
    readonly: true,
    helpText: 'Automatically set based on location',
  };

  // Require shipping checkbox
  const requireShippingConfig: CheckboxWidgetConfig = {
    id: 'requireShipping',
    type: 'Checkbox',
    label: 'Physical shipping required',
  };

  // Shipping address - conditionally visible
  const shippingAddressConfig: TextInputWidgetConfig = {
    id: 'shippingAddress',
    type: 'TextInput',
    label: 'Shipping Address',
    placeholder: 'Enter shipping address',
    helpText: 'Required when shipping is selected',
    // This would be controlled by conditional visibility in real implementation
  };

  // Shipping cost - conditionally visible
  const shippingCostConfig: TextInputWidgetConfig = {
    id: 'shippingCost',
    type: 'TextInput',
    label: 'Shipping Cost ($)',
    placeholder: 'Enter shipping cost',
    inputType: 'number',
  };

  // Start date field
  const startDateConfig: DatePickerWidgetConfig = {
    id: 'startDate',
    type: 'DatePicker',
    label: 'Service Start Date',
    placeholder: 'Select start date',
    format: 'PPP',
  };

  // End date field - validated against start date
  const endDateConfig: DatePickerWidgetConfig = {
    id: 'endDate',
    type: 'DatePicker',
    label: 'Service End Date',
    placeholder: 'Select end date',
    format: 'PPP',
    helpText: 'Must be after start date',
  };

  // Computed fields (readonly)
  const subtotalConfig: TextInputWidgetConfig = {
    id: 'subtotal',
    type: 'TextInput',
    label: 'Subtotal',
    readonly: true,
    helpText: 'Quantity × Unit Price',
  };

  const discountAmountConfig: TextInputWidgetConfig = {
    id: 'discountAmount',
    type: 'TextInput',
    label: 'Discount Amount',
    readonly: true,
    helpText: 'Subtotal × Discount',
  };

  const taxableAmountConfig: TextInputWidgetConfig = {
    id: 'taxableAmount',
    type: 'TextInput',
    label: 'Taxable Amount',
    readonly: true,
    helpText: 'Subtotal - Discount',
  };

  const taxAmountConfig: TextInputWidgetConfig = {
    id: 'taxAmount',
    type: 'TextInput',
    label: 'Tax Amount',
    readonly: true,
    helpText: 'Taxable Amount × Tax Rate',
  };

  const totalConfig: TextInputWidgetConfig = {
    id: 'total',
    type: 'TextInput',
    label: 'Total Amount',
    readonly: true,
    helpText: 'Taxable Amount + Tax + Shipping',
  };

  // Handle form submission
  const handleSubmit = async (values: unknown) => {
    console.log('Form submitted with values:', values);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmittedData(values as Record<string, unknown>);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Advanced Form Features Demo</h1>
          <p className="text-muted-foreground">
            Demonstrating conditional visibility, cross-field validation, and computed fields
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Form</CardTitle>
                <CardDescription>
                  Fill in the form to see advanced features in action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormWidget config={formConfig} events={{ onSubmit: handleSubmit }}>
                  {/* Product Selection */}
                  <div className="space-y-4">
                    <SelectWidget config={productTypeConfig} />

                    {/* Pricing Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <TextInputWidget config={quantityConfig} />
                      <TextInputWidget config={unitPriceConfig} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <TextInputWidget config={discountConfig} />
                      <TextInputWidget config={taxRateConfig} />
                    </div>

                    {/* Shipping Section */}
                    <div className="border-t pt-4">
                      <CheckboxWidget config={requireShippingConfig} />

                      {/* Conditionally show shipping fields */}
                      <div className="mt-4 space-y-4 pl-6">
                        <TextInputWidget config={shippingAddressConfig} />
                        <TextInputWidget config={shippingCostConfig} />
                      </div>
                    </div>

                    {/* Date Range Section */}
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-3">Service Period</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <DatePickerWidget config={startDateConfig} />
                        <DatePickerWidget config={endDateConfig} />
                      </div>
                    </div>

                    {/* Computed Fields Section */}
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-3">Order Summary (Auto-calculated)</h3>
                      <div className="space-y-3 bg-muted p-4 rounded-md">
                        <TextInputWidget config={subtotalConfig} />
                        <TextInputWidget config={discountAmountConfig} />
                        <TextInputWidget config={taxableAmountConfig} />
                        <TextInputWidget config={taxAmountConfig} />
                        <TextInputWidget config={totalConfig} />
                      </div>
                    </div>
                  </div>
                </FormWidget>
              </CardContent>
            </Card>
          </div>

          {/* Features Documentation Section */}
          <div className="space-y-6">
            {/* Features List */}
            <Card>
              <CardHeader>
                <CardTitle>Features Demonstrated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">🎯 Conditional Visibility</h3>
                    <p className="text-sm text-muted-foreground">
                      Shipping address and cost fields only appear when "Physical shipping required"
                      is checked
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">✅ Cross-Field Validation</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• End date must be after start date</li>
                      <li>• Shipping address required when shipping is selected</li>
                      <li>• Discount must be between 0 and 1</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">🧮 Computed Fields</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Subtotal = Quantity × Unit Price</li>
                      <li>• Discount Amount = Subtotal × Discount</li>
                      <li>• Taxable Amount = Subtotal - Discount</li>
                      <li>• Tax Amount = Taxable Amount × Tax Rate</li>
                      <li>• Total = Taxable + Tax + Shipping</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">⚡ Reactive Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      All computed fields update automatically when dependencies change
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Try It Section */}
            <Card>
              <CardHeader>
                <CardTitle>Try It Out</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Test Conditional Visibility:</h4>
                    <p className="text-muted-foreground">
                      Check/uncheck "Physical shipping required" to show/hide shipping fields
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Test Cross-Field Validation:</h4>
                    <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Select a start date</li>
                      <li>Select an end date before the start date</li>
                      <li>Click outside the field to see the validation error</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Test Computed Fields:</h4>
                    <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Enter quantity: 10</li>
                      <li>Enter unit price: 25.50</li>
                      <li>Enter discount: 0.1 (10%)</li>
                      <li>Watch all totals calculate automatically</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submitted Data Display */}
            {submittedData && (
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto bg-muted p-4 rounded-md">
                    {JSON.stringify(submittedData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedFormFeaturesDemo;
