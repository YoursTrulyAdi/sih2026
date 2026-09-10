import React from 'react';
import Head from 'next/head';
import ProjectForm from '@/components/admin/ProjectForm';
import AuthGuard from '@/components/auth/AuthGuard';

export default function NewProjectPage() {
  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <Head>
        <title>Create New Project Baseline | InfraTrack 2026</title>
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProjectForm />
      </div>
    </AuthGuard>
  );
}
