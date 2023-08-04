// @ts-nocheck
export const loader1 = async ({ request, params }) => {
  return fetch(`/fake/api/teams/${params.teamId}.json`, {
    signal: request.signal,
  });
};
