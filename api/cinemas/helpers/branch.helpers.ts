import { getCinemaBranches } from '../cinemas.api';
import { extractAllCinemaSysIds } from './cinema-system.helpers';
import { BranchBase } from '../cinemas.types';

/**
 * Branch Operations
 * Functions for working with cinema branches (specific theater locations)
 */

export async function getCinemaIdByBranchName(branchName: string): Promise<string> {
    const cinemaIds = await extractAllCinemaSysIds();

    for (const id of cinemaIds) {
        const branches = await getCinemaBranches(id);
        const branchNames = branches.map(b => b.tenCumRap);

        if (branchNames.includes(branchName))
            return id;
    }

    throw new Error(`No Cinema found for this branch ${branchName}`);
}

export async function matchBranchNameAndId(value: string): Promise<string> {
    const cinemaIds = await extractAllCinemaSysIds();

    for (const id of cinemaIds) {
        const branches = await getCinemaBranches(id);
        for (const branch of branches) {
            if (branch.maCumRap === value || branch.tenCumRap === value) {
                return branch.maCumRap === value ? branch.tenCumRap : branch.maCumRap ?? '';
            }
        }
    }
    throw new Error('Unidentified Branch Id or Name');
}

export async function getBranchInfoById(branchId: string): Promise<BranchBase> {
    const cinemaIds = await extractAllCinemaSysIds();

    for (const id of cinemaIds) {
        const branches = await getCinemaBranches(id);
        const branch = branches.find(b => b.maCumRap === branchId);

        if (branch) {
            return branch;
        }
    }

    throw new Error(`No branch found for this id ${branchId}`);
}
