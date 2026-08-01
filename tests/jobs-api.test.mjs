import test from 'node:test';
import assert from 'node:assert/strict';
import { loadFallbackJobs, mergeJobs } from '../api/jobs.mjs';

test('mergeJobs combines and deduplicates jobs from multiple sources', () => {
  const merged = mergeJobs([
    {
      id: 'job-1',
      title: 'Senior Customer Service Officer (Airport)',
      company: 'Test Company',
      url: 'https://job-maldives.com/1',
      postedTime: '2026-07-01T00:00:00.000Z',
      postedDate: '2026-07-01T00:00:00.000Z',
      source: 'job-maldives.com',
      fetchedAt: '2026-08-01T00:00:00.000Z',
    },
  ], [
    {
      id: 'job-3',
      title: 'Executive Revenue Accounting',
      company: 'Ooredoo Maldives',
      url: 'https://jobcenter.mv/en/jobs/executive-revenue-accounting',
      postedTime: '',
      postedDate: '',
      source: 'jobcenter.mv',
      fetchedAt: '2026-08-01T00:00:00.000Z',
    },
  ], [
    {
      id: 'jobsicle-1',
      title: 'Senior Customer Service Officer (Airport) / Customer Service Officer (Airport)',
      company: 'Unknown',
      url: 'https://jobsicle.mv/',
      postedTime: '',
      postedDate: '',
      source: 'jobsicle.mv',
      fetchedAt: '2026-08-01T00:00:00.000Z',
    },
    {
      id: 'jobsicle-2',
      title: 'Customer Services Representative',
      company: 'MAAHIYA PVT LTD',
      url: 'https://jobsicle.mv/',
      postedTime: '',
      postedDate: '',
      source: 'jobsicle.mv',
      fetchedAt: '2026-08-01T00:00:00.000Z',
    },
  ]);

  assert.equal(merged.length, 4);
  assert.ok(merged.some((job) => job.source === 'jobsicle.mv' && /Senior Customer Service Officer/i.test(job.title)));
  assert.ok(merged.some((job) => job.source === 'jobsicle.mv' && /Customer Services Representative/i.test(job.title)));
  assert.ok(merged.some((job) => job.source === 'jobcenter.mv'));
  assert.ok(merged[0].postedDate || merged[0].fetchedAt);
});

test('mergeJobs injects fallback jobs when no Jobsicle content is present', () => {
  const merged = mergeJobs([], [], []);
  const hasTarget = merged.some((job) => /Senior Customer Service Officer|Customer Service Officer/i.test(job.title));

  assert.ok(merged.length >= 3);
  assert.equal(hasTarget, true);
});
