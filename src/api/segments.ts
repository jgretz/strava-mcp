import { stravaGet } from './client.ts';
import type { Result, Segment, SegmentEffort, ExploreSegmentsResponse } from '../types.ts';

export function getSegment(id: number): Promise<Result<Segment, string>> {
  return stravaGet<Segment>(`/segments/${id}`);
}

type ExploreOpts = {
  bounds: string; // sw_lat,sw_lng,ne_lat,ne_lng
  activityType?: string;
  minClimbCategory?: number;
  maxClimbCategory?: number;
};

export function exploreSegments(opts: ExploreOpts): Promise<Result<ExploreSegmentsResponse, string>> {
  const params: Record<string, string> = { bounds: opts.bounds };
  if (opts.activityType) params.activity_type = opts.activityType;
  if (opts.minClimbCategory !== undefined) params.min_cat = String(opts.minClimbCategory);
  if (opts.maxClimbCategory !== undefined) params.max_cat = String(opts.maxClimbCategory);
  return stravaGet<ExploreResponse>('/segments/explore', params);
}

export function getSegmentEffort(id: number): Promise<Result<SegmentEffort, string>> {
  return stravaGet<SegmentEffort>(`/segment_efforts/${id}`);
}

type ListEffortsOpts = {
  segmentId: number;
  startDate?: string;
  endDate?: string;
  perPage?: number;
};

export function listSegmentEfforts(opts: ListEffortsOpts): Promise<Result<SegmentEffort[], string>> {
  const params: Record<string, string> = {};
  if (opts.startDate) params.start_date_local = opts.startDate;
  if (opts.endDate) params.end_date_local = opts.endDate;
  if (opts.perPage) params.per_page = String(opts.perPage);
  return stravaGet<SegmentEffort[]>(`/segments/${opts.segmentId}/all_efforts`, params);
}
