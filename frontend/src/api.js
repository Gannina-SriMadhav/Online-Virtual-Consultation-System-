export const API_BASE = import.meta.env.DEV ? 'http://localhost:8080/api' : '/api';

export const loginUser = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (res.status === 403) throw new Error("Account pending administrative approval. Please wait for an Admin to verify your credentials.");
    if (!res.ok) throw new Error("Invalid credentials or server error.");
    return res.text();
};

export const approveUser = async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}/approve`, { method: 'PUT' });
    return res.json();
};

export const deleteUser = async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Failed to delete user.");
    return true;
};

export const getPatientAppointments = async (patientId) => {
    try {
        const res = await fetch(`${API_BASE}/appointments/patient/${patientId}`);
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
};

export const getDoctorConsultations = async (doctorId) => {
    try {
        const res = await fetch(`${API_BASE}/appointments/doctor/${doctorId}`);
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
};

export const getPatientRecords = async (patientId) => {
    try {
        const res = await fetch(`${API_BASE}/records/patient/${patientId}`);
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
};

export const getAllPrescriptions = async () => {
    try {
        const res = await fetch(`${API_BASE}/prescriptions`);
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
};

export const fulfillPrescription = async (id) => {
    const res = await fetch(`${API_BASE}/prescriptions/${id}/fulfill`, { method: 'PUT' });
    return res.json();
};

export const getAllUsers = async () => {
    try {
        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
};

export const createAppointment = async (appt) => {
    const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appt)
    });
    return res.json();
};

export const issuePrescription = async (prescription) => {
    const res = await fetch(`${API_BASE}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescription)
    });
    return res.json();
};

export const addMedicalRecord = async (record) => {
    const res = await fetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
    });
    return res.json();
};

export const cancelAppointment = async (id) => {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to cancel appointment');
    return true;
};

export const completeAppointment = async (id) => {
    const res = await fetch(`${API_BASE}/appointments/${id}/complete`, {
        method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to complete consultation');
    return res.json();
};

export const updateUserProfile = async (id, user) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || 'Failed to update profile details');
    }
    return res.json();
};

export const rateUserSession = async (id, ratingScore) => {
    const res = await fetch(`${API_BASE}/users/${id}/rate?ratingScore=${ratingScore}`, {
        method: 'PUT'
    });
    if (!res.ok) throw new Error('Failed to submit user rating');
    return res.json();
};

export const verifyPrescriptionCode = async (code) => {
    const res = await fetch(`${API_BASE}/prescriptions/verify/${code}`);
    if (!res.ok) throw new Error('Invalid code or prescription already dispensed');
    return res.json();
};

export const updateAppointment = async (id, appt) => {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appt)
    });
    return res.json();
};

export const getAuditLogs = async () => {
    try {
        const res = await fetch(`${API_BASE}/audit-logs`);
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
};

export const createAuditLog = async (userId, userName, userRole, action, details) => {
    try {
        await fetch(`${API_BASE}/audit-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userName, userRole, action, details })
        });
    } catch { console.error("Audit log creation failed"); }
};

