export async function browserBrowsingDataRemoveDomainCache(domain: string) {
  await browser.browsingData.remove(
    {hostnames: [domain]},
    {cache: true}
  );
}