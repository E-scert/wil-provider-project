import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getCompanyAddress, updateCompanyProfile, upsertCompanyAddress } from '../../api/companies.js';
import { Card, Field, Input, Textarea, Button, SectionHeading, Spinner } from '../../components/ui.jsx';

export default function CompanyDashboard() {
  const { profile, refreshProfile } = useAuth(); // profile = company row
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ compName: '', compEmail: '', compDescription: '' });
  const [addressForm, setAddressForm] = useState({
    recipientName: '', buildingStreetName: '', unit: '', suburb: '', city: '', postalCode: '', country: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setProfileForm({ compName: profile.comp_name || '', compEmail: profile.comp_email || '', compDescription: profile.comp_description || '' });
    getCompanyAddress(profile.comp_id)
      .then((addr) => {
        if (addr) {
          setAddressForm({
            recipientName: addr.recipient_name || '',
            buildingStreetName: addr.building_street_name || '',
            unit: addr.unit || '',
            suburb: addr.suburb || '',
            city: addr.city || '',
            postalCode: addr.postal_code || '',
            country: addr.country || '',
          });
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [profile?.comp_id]); // eslint-disable-line

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateCompanyProfile(profile.comp_id, profileForm);
      toast.success('Company profile updated.');
      refreshProfile();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveAddress(e) {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await upsertCompanyAddress(profile.comp_id, addressForm);
      toast.success('Address updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingAddress(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Company" title={profile ? profile.comp_name : 'Dashboard'} subtitle="Manage your company profile and address." />

      {loading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-6">
          <Card className="animate-riseIn">
            <h2 className="mb-4 font-display text-base font-semibold text-white">Company profile</h2>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <Field label="Company name"><Input required value={profileForm.compName} onChange={(e) => setProfileForm((f) => ({ ...f, compName: e.target.value }))} /></Field>
              <Field label="Company email"><Input type="email" required value={profileForm.compEmail} onChange={(e) => setProfileForm((f) => ({ ...f, compEmail: e.target.value }))} /></Field>
              <Field label="Description"><Textarea rows={3} value={profileForm.compDescription} onChange={(e) => setProfileForm((f) => ({ ...f, compDescription: e.target.value }))} /></Field>
              <Button type="submit" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save profile'}</Button>
            </form>
          </Card>

          <Card className="animate-riseIn">
            <h2 className="mb-4 font-display text-base font-semibold text-white">Address</h2>
            <form onSubmit={handleSaveAddress} className="grid gap-4 sm:grid-cols-2">
              <Field label="Recipient name"><Input value={addressForm.recipientName} onChange={(e) => setAddressForm((f) => ({ ...f, recipientName: e.target.value }))} /></Field>
              <Field label="Unit (optional)"><Input value={addressForm.unit} onChange={(e) => setAddressForm((f) => ({ ...f, unit: e.target.value }))} /></Field>
              <div className="sm:col-span-2">
                <Field label="Building & street"><Input required value={addressForm.buildingStreetName} onChange={(e) => setAddressForm((f) => ({ ...f, buildingStreetName: e.target.value }))} /></Field>
              </div>
              <Field label="Suburb"><Input value={addressForm.suburb} onChange={(e) => setAddressForm((f) => ({ ...f, suburb: e.target.value }))} /></Field>
              <Field label="City"><Input required value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} /></Field>
              <Field label="Postal code"><Input required value={addressForm.postalCode} onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))} /></Field>
              <Field label="Country"><Input required value={addressForm.country} onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))} /></Field>
              <Button type="submit" disabled={savingAddress} className="sm:col-span-2">{savingAddress ? 'Saving…' : 'Save address'}</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
