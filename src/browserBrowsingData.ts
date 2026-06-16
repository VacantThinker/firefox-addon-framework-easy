export async function browserBrowsingDataRemoveDomainCache(domain: string) {
  await browser.browsingData.remove(
    {hostnames: [`http://${domain}`, `https://${domain}`]},
    {cache: true}
  );
}