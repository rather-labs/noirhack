import { jwtvotingContractArtifact } from './src/artifacts/jwtvoting.js';
import { Contract, createPXEClient } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';
const { PXE_URL = 'http://localhost:8080' } = process.env;
async function main() {
    console.log(`Connecting to PXE: ${PXE_URL}...`);
    const pxe = createPXEClient(PXE_URL);
    //await waitForPXE(pxe);
    console.log('Getting test account...');
    const [ownerWallet] = await getInitialTestAccountsWallets(pxe);
    const ownerAddress = ownerWallet.getAddress();
    console.log('Deploying contract...');
    const contract = await Contract.deploy(ownerWallet, jwtvotingContractArtifact, [ownerAddress])
        .send()
        .deployed();
    console.log(`Contract deployed at ${contract.address.toString()}`);
}
main().catch(err => {
    console.error('Error in deployment:', err);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vZGVwbG95LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3pFLE9BQU8sRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFjLE1BQU0saUJBQWlCLENBQUM7QUFDeEUsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFeEUsTUFBTSxFQUFFLE9BQU8sR0FBRyx1QkFBdUIsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFFMUQsS0FBSyxVQUFVLElBQUk7SUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsT0FBTyxLQUFLLENBQUMsQ0FBQztJQUNoRCxNQUFNLEdBQUcsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckMsd0JBQXdCO0lBRXhCLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUN2QyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsTUFBTSw2QkFBNkIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7SUFFOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUseUJBQXlCLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMzRixJQUFJLEVBQUU7U0FDTixRQUFRLEVBQUUsQ0FBQztJQUVkLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7SUFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIn0=