import { CruisePathBuilder } from '@fmgc/guidance/vnav/cruise/CruisePathBuilder';
import { DescentPathBuilder } from '@fmgc/guidance/vnav/descent/DescentPathBuilder';
import { NavGeometryProfile, VerticalCheckpointReason } from '@fmgc/guidance/vnav/profile/NavGeometryProfile';
import { ClimbStrategy } from '@fmgc/guidance/vnav/climb/ClimbStrategy';
import { DescentStrategy } from '@fmgc/guidance/vnav/descent/DescentStrategy';
import { ApproachPathBuilder } from '@fmgc/guidance/vnav/descent/ApproachPathBuilder';
import { SpeedProfile } from '@fmgc/guidance/vnav/climb/SpeedProfile';
import { VerticalProfileComputationParametersObserver } from '@fmgc/guidance/vnav/VerticalProfileComputationParameters';
import { FmgcFlightPhase } from '@shared/flightphase';
<<<<<<< HEAD
<<<<<<< HEAD
import { WindProfile } from '@fmgc/guidance/vnav/wind/WindProfile';
import { AircraftHeadingProfile } from '@fmgc/guidance/vnav/wind/AircraftHeadingProfile';
=======
import { HeadwindProfile } from '@fmgc/guidance/vnav/wind/HeadwindProfile';
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
=======
import { WindProfile } from '@fmgc/guidance/vnav/wind/WindProfile';
import { AircraftHeadingProfile } from '@fmgc/guidance/vnav/wind/AircraftHeadingProfile';
>>>>>>> e32af2103bd1f998ea7bb776765d1a8c79d006c3

export class CruiseToDescentCoordinator {
    private lastEstimatedFuelAtDestination: Pounds = 2300;

    private lastEstimatedTimeAtDestination: Seconds = 0;

    constructor(
        private observer: VerticalProfileComputationParametersObserver,
        private cruisePathBuilder: CruisePathBuilder,
        private descentPathBuilder: DescentPathBuilder,
        private approachPathBuilder: ApproachPathBuilder,
    ) { }

    resetEstimations() {
        this.lastEstimatedFuelAtDestination = 2300;
        this.lastEstimatedTimeAtDestination = 0;
    }

    buildCruiseAndDescentPath(
        profile: NavGeometryProfile,
        speedProfile: SpeedProfile,
<<<<<<< HEAD
<<<<<<< HEAD
        descentWinds: WindProfile,
        headingProfile: AircraftHeadingProfile,
=======
        cruiseWinds: HeadwindProfile,
        descentWinds: HeadwindProfile,
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
=======
        descentWinds: WindProfile,
        headingProfile: AircraftHeadingProfile,
>>>>>>> e32af2103bd1f998ea7bb776765d1a8c79d006c3
        stepClimbStrategy: ClimbStrategy,
        stepDescentStrategy: DescentStrategy,
    ) {
        // - Start with initial guess for fuel on board at destination
        // - Compute descent profile to get distance to T/D and burnt fuel during descent
        // - Compute cruise profile to T/D -> guess new guess for fuel at start T/D, use fuel burn to get new estimate for fuel at destination
        // - Repeat
        const topOfClimbIndex = profile.checkpoints.findIndex((checkpoint) => checkpoint.reason === VerticalCheckpointReason.TopOfClimb);
        const presentPositionIndex = profile.checkpoints.findIndex((checkpoint) => checkpoint.reason === VerticalCheckpointReason.PresentPosition);

        const startOfCruiseIndex = topOfClimbIndex >= 0 ? topOfClimbIndex : presentPositionIndex;
        const startOfCruiseCheckpoint = profile.checkpoints[startOfCruiseIndex];

        if (startOfCruiseIndex < 0) {
            return;
        }

        let iterationCount = 0;
        let todFuelError = Infinity;
        let todTimeError = Infinity;

        if (Number.isNaN(this.lastEstimatedFuelAtDestination) || Number.isNaN(this.lastEstimatedTimeAtDestination)) {
            this.resetEstimations();
        }

        while (iterationCount++ < 4 && (Math.abs(todFuelError) > 100 || Math.abs(todTimeError) > 1)) {
            // Reset checkpoints
            profile.checkpoints.splice(startOfCruiseIndex + 1, profile.checkpoints.length - startOfCruiseIndex - 1);
            this.approachPathBuilder.computeApproachPath(profile, speedProfile, this.lastEstimatedFuelAtDestination, this.lastEstimatedTimeAtDestination);

            // Geometric and idle
<<<<<<< HEAD
<<<<<<< HEAD
            const todCheckpoint = this.descentPathBuilder.computeManagedDescentPath(profile, speedProfile, descentWinds, headingProfile, this.cruisePathBuilder.getFinalCruiseAltitude());
=======
            const todCheckpoint = this.descentPathBuilder.computeManagedDescentPath(profile, speedProfile, descentWinds, this.cruisePathBuilder.getFinalCruiseAltitude());
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
=======
            const todCheckpoint = this.descentPathBuilder.computeManagedDescentPath(profile, speedProfile, descentWinds, headingProfile, this.cruisePathBuilder.getFinalCruiseAltitude());
>>>>>>> e32af2103bd1f998ea7bb776765d1a8c79d006c3
            if (todCheckpoint.distanceFromStart < startOfCruiseCheckpoint.distanceFromStart) {
                // T/D Reached
                return;
            }

<<<<<<< HEAD
<<<<<<< HEAD
            const cruisePath = this.cruisePathBuilder.computeCruisePath(profile, stepClimbStrategy, stepDescentStrategy, speedProfile);
=======
            const cruisePath = this.cruisePathBuilder.computeCruisePath(profile, stepClimbStrategy, stepDescentStrategy, speedProfile, cruiseWinds);
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
=======
            const cruisePath = this.cruisePathBuilder.computeCruisePath(profile, stepClimbStrategy, stepDescentStrategy, speedProfile);
>>>>>>> e32af2103bd1f998ea7bb776765d1a8c79d006c3

            if (!cruisePath || !todCheckpoint) {
                throw new Error('[FMS/VNAV] Could not coordinate cruise and descent path');
            }

            todFuelError = cruisePath.remainingFuelOnBoardAtTopOfDescent - todCheckpoint.remainingFuelOnBoard;
            todTimeError = cruisePath.secondsFromPresentAtTopOfDescent - todCheckpoint.secondsFromPresent;

            this.lastEstimatedFuelAtDestination += todFuelError;
            this.lastEstimatedTimeAtDestination += todTimeError;
        }
    }

    addSpeedLimitAsCheckpoint(profile: NavGeometryProfile) {
        const { flightPhase, descentSpeedLimit: { underAltitude }, presentPosition: { alt }, cruiseAltitude } = this.observer.get();

        // Don't try to place speed limit if the cruise alt is higher
        if (underAltitude > cruiseAltitude) {
            return;
        }

        if ((underAltitude <= alt) && flightPhase >= FmgcFlightPhase.Descent) {
            return;
        }

        const distance = profile.interpolateDistanceAtAltitudeBackwards(underAltitude);

        profile.addInterpolatedCheckpoint(distance, { reason: VerticalCheckpointReason.CrossingDescentSpeedLimit });
    }

    canCompute(profile: NavGeometryProfile) {
        return this.approachPathBuilder?.canCompute(profile);
    }
}
