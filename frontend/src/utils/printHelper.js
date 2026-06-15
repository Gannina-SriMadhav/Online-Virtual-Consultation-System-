export const printPrescription = (prescription, patientName, doctorName, age, dateStr) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://medconnect-health.org/verify-rx/${prescription.verificationCode || prescription.id}`;
  const displayDate = dateStr ? new Date(dateStr).toLocaleString() : new Date().toLocaleString();

  const htmlContent = `
    <html>
      <head>
        <title>MedConnect E-Prescription - RX-${prescription.id ? prescription.id.substring(0, 8) : 'NEW'}</title>
        <style>
          body {
            font-family: 'DM Sans', Arial, sans-serif;
            color: #1e293b;
            padding: 40px;
            margin: 0;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #863bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #863bff;
          }
          .hospital-info {
            text-align: right;
            font-size: 12px;
            color: #64748b;
          }
          .rx-label {
            font-size: 28px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 20px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .meta-item {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e2e8f0;
            padding: 8px 0;
          }
          .meta-item span:first-child {
            color: #64748b;
            font-weight: 600;
          }
          .meta-item span:last-child {
            font-weight: 500;
          }
          .prescription-body {
            min-height: 250px;
            margin-bottom: 35px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #863bff;
            text-transform: uppercase;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 15px;
          }
          .medication-details {
            font-size: 16px;
            font-weight: 600;
            line-height: 1.6;
            margin-bottom: 10px;
            white-space: pre-wrap;
          }
          .instructions {
            font-size: 14px;
            color: #475569;
            background: #f1f5f9;
            padding: 12px 16px;
            border-left: 4px solid #863bff;
            border-radius: 0 8px 8px 0;
            margin-bottom: 25px;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 60px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 30px;
          }
          .signature-area {
            text-align: center;
          }
          .signature-line {
            width: 180px;
            border-bottom: 1.5px solid #475569;
            margin-bottom: 8px;
            height: 40px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
          }
          .qr-area {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 11px;
            color: #64748b;
            max-width: 300px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <span style="font-size: 28px;">🏥</span>
            <div>
              <div class="logo-text">MedConnect Health</div>
              <div style="font-size: 11px; color: #64748b;">Secure Virtual Clinic Network</div>
            </div>
          </div>
          <div class="hospital-info">
            <strong>MedConnect Care HQ</strong><br/>
            75 Healthcare Blvd, Suite 400<br/>
            Support: medconnect@gmail.com
          </div>
        </div>

        <div class="rx-label">℞ E-PRESCRIPTION</div>

        <div class="meta-grid">
          <div>
            <div class="meta-item">
              <span>Patient Name:</span>
              <span>${patientName || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <span>Age:</span>
              <span>${age || 'N/A'} years old</span>
            </div>
          </div>
          <div>
            <div class="meta-item">
              <span>Prescribing Doctor:</span>
              <span>Dr. ${doctorName || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <span>Date / Time:</span>
              <span>${displayDate}</span>
            </div>
          </div>
        </div>

        <div class="prescription-body">
          <div class="section-title">Prescribed Medications</div>
          <div class="medication-details">${prescription.medicationDetails || 'No medication details provided.'}</div>
          
          <div class="section-title">Usage & Instructions</div>
          <div class="instructions">${prescription.instructions || 'No specific usage instructions provided.'}</div>

          ${prescription.drugWarnings ? `
            <div class="section-title" style="color: #f97316;">⚠️ Clinical Warnings</div>
            <div class="instructions" style="border-left-color: #f97316; background: #fff7ed; color: #c2410c;">
              ${prescription.drugWarnings}
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <div class="qr-area">
            <img src="${qrCodeUrl}" alt="QR Verification" width="100" height="100" />
            <div>
              <strong style="color: #1e293b;">Scan to Verify</strong><br/>
              Scan this QR code with a pharmacy terminal to decrypt verification token:<br/>
              <span style="font-family: monospace; font-size: 12px; font-weight: bold; color: #863bff;">${prescription.verificationCode || 'ML-XXXX'}</span>
            </div>
          </div>
          <div class="signature-area">
            <div class="signature-line">
              <span style="font-family: 'Georgia', serif; font-style: italic; color: #475569; font-size: 18px;">Dr. ${doctorName ? doctorName.split(' ')[0] : 'Clinician'}</span>
            </div>
            <div style="font-size: 12px; font-weight: bold; color: #475569;">Authorized Signature</div>
            <div style="font-size: 10px; color: #94a3b8;">License Ref: Verified</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const printInvoice = (appointment, patientName, doctorName, dateStr) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  const displayDate = dateStr ? new Date(dateStr).toLocaleString() : new Date().toLocaleString();
  const amount = appointment.paymentAmount || 500.00;
  const transactionId = appointment.paymentTransactionId || `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const htmlContent = `
    <html>
      <head>
        <title>Payment Receipt - INV-${appointment.id ? appointment.id.substring(0, 8) : 'NEW'}</title>
        <style>
          body {
            font-family: 'DM Sans', Arial, sans-serif;
            color: #1e293b;
            padding: 40px;
            margin: 0;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
          }
          .hospital-info {
            text-align: right;
            font-size: 12px;
            color: #64748b;
          }
          .rx-label {
            font-size: 28px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 20px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .meta-item {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e2e8f0;
            padding: 8px 0;
          }
          .meta-item span:first-child {
            color: #64748b;
            font-weight: 600;
          }
          .meta-item span:last-child {
            font-weight: 500;
          }
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .invoice-table th {
            background: #f1f5f9;
            text-align: left;
            padding: 12px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            color: #475569;
          }
          .invoice-table td {
            padding: 16px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
          }
          .total-box {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 20px;
          }
          .footer-note {
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            margin-top: 100px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <span style="font-size: 28px;">🏥</span>
            <div>
              <div class="logo-text">MedConnect Health</div>
              <div style="font-size: 11px; color: #64748b;">Secure Virtual Clinic Network</div>
            </div>
          </div>
          <div class="hospital-info">
            <strong>MedConnect Care HQ</strong><br/>
            75 Healthcare Blvd, Suite 400<br/>
            Billing Department: medconnect@gmail.com
          </div>
        </div>

        <div class="rx-label">INVOICE & RECEIPT</div>

        <div class="meta-grid">
          <div>
            <div class="meta-item">
              <span>Billed To:</span>
              <span>${patientName || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <span>Transaction ID:</span>
              <span style="font-family: monospace; font-size: 11px; font-weight: bold;">${transactionId}</span>
            </div>
          </div>
          <div>
            <div class="meta-item">
              <span>Consulting Doctor:</span>
              <span>Dr. ${doctorName || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <span>Date of Payment:</span>
              <span>${displayDate}</span>
            </div>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Status</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Telehealth Virtual Consultation Session</strong><br/>
                <span style="font-size: 12px; color: #64748b;">WebRTC HD Video Consultation Room Booking Charge</span>
              </td>
              <td>1</td>
              <td><span style="color: #10b981; font-weight: bold;">PAID</span></td>
              <td style="text-align: right; font-weight: bold;">₹${amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          Total Paid: ₹${amount.toFixed(2)}
        </div>

        <div class="footer-note">
          This is an electronically generated payment receipt. No physical signature is required.<br/>
          Thank you for choosing MedConnect Care Network. For refund inquiries, please submit a request through your patient settings dashboard.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
