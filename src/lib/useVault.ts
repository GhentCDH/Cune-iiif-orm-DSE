import { Vault } from '@iiif/helpers/vault'

// Singleton vault instance
const vault = new Vault()

export const useVault = (): Vault => {
  return vault
}
