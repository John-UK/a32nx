import { VerticalProfileComputationParametersObserver } from '@fmgc/guidance/vnav/VerticalProfileComputationParameters';
import { Step, StepCoordinator } from '@fmgc/guidance/vnav/StepCoordinator';
import { VnavConfig } from '@fmgc/guidance/vnav/VnavConfig';
import { ClimbStrategy } from '@fmgc/guidance/vnav/climb/ClimbStrategy';
import { DescentStrategy } from '@fmgc/guidance/vnav/descent/DescentStrategy';
import { BaseGeometryProfile } from '@fmgc/guidance/vnav/profile/BaseGeometryProfile';
import { ManagedSpeedType, SpeedProfile } from '@fmgc/guidance/vnav/climb/SpeedProfile';
import { EngineModel } from '@fmgc/guidance/vnav/EngineModel';
import { WindComponent } from '@fmgc/guidance/vnav/wind';
import { TemporaryCheckpointSequence } from '@fmgc/guidance/vnav/profile/TemporaryCheckpointSequence';
<<<<<<< HEAD
=======
import { HeadwindProfile } from '@fmgc/guidance/vnav/wind/HeadwindProfile';
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
import { Predictions, StepResults } from '../Predictions';
import { MaxSpeedConstraint, VerticalCheckpointReason } from '../profile/NavGeometryProfile';
import { AtmosphericConditions } from '../AtmosphericConditions';

export interface CruisePathBuilderResults {
    remainingFuelOnBoardAtTopOfDescent: number,
    secondsFromPresentAtTopOfDescent: number
}

export class CruisePathBuilder {
    constructor(private computationParametersObserver: VerticalProfileComputationParametersObserver,
        private atmosphericConditions: AtmosphericConditions,
        private stepCoordinator: StepCoordinator) { }

    update() {
        this.atmosphericConditions.update();
    }

<<<<<<< HEAD
    computeCruisePath(profile: BaseGeometryProfile, stepClimbStrategy: ClimbStrategy, stepDescentStrategy: DescentStrategy, speedProfile: SpeedProfile): CruisePathBuilderResults {
=======
    computeCruisePath(
        profile: BaseGeometryProfile,
        stepClimbStrategy: ClimbStrategy,
        stepDescentStrategy: DescentStrategy,
        speedProfile: SpeedProfile,
        windProfile: HeadwindProfile,
    ): CruisePathBuilderResults {
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
        const topOfClimb = profile.findVerticalCheckpoint(VerticalCheckpointReason.TopOfClimb);
        const presentPosition = profile.findVerticalCheckpoint(VerticalCheckpointReason.PresentPosition);

        const startOfCruise = topOfClimb ?? presentPosition;

        const topOfDescent = profile.findVerticalCheckpoint(VerticalCheckpointReason.TopOfDescent);

        if (!startOfCruise?.distanceFromStart || !topOfDescent?.distanceFromStart) {
            throw new Error('[FMS/VNAV] Start of cruise or T/D could not be located');
        }

        if (startOfCruise.distanceFromStart > topOfDescent.distanceFromStart) {
            throw new Error('[FMS/VNAV] Cruise segment too short');
        }

        const sequence = new TemporaryCheckpointSequence(startOfCruise);

        for (const step of this.stepCoordinator.steps) {
            // If the step is too close to T/D
            if (step.isIgnored) {
                continue;
            }

            if (step.distanceFromStart < startOfCruise.distanceFromStart || step.distanceFromStart > topOfDescent.distanceFromStart) {
                if (VnavConfig.DEBUG_PROFILE) {
                    console.warn(
                        `[FMS/VNAV] Cruise step is not within cruise segment \
                        (${step.distanceFromStart.toFixed(2)} NM, T/C: ${startOfCruise.distanceFromStart.toFixed(2)} NM, T/D: ${topOfDescent.distanceFromStart.toFixed(2)} NM)`,
                    );
                }

                continue;
            }

            // See if there are any speed constraints before the step
            for (const speedConstraint of profile.maxClimbSpeedConstraints) {
                if (speedConstraint.distanceFromStart > step.distanceFromStart) {
                    continue;
                }

<<<<<<< HEAD
                this.addSegmentToSpeedConstraint(sequence, speedConstraint, speedProfile);
=======
                this.addSegmentToSpeedConstraint(sequence, speedConstraint, speedProfile, windProfile);
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
            }

            const { distanceFromStart, altitude, remainingFuelOnBoard } = sequence.lastCheckpoint;

            const speed = speedProfile.getTarget(distanceFromStart, altitude, ManagedSpeedType.Cruise);
<<<<<<< HEAD
            const segmentToStep = this.computeCruiseSegment(step.distanceFromStart - distanceFromStart, remainingFuelOnBoard, speed);
=======
            const headwind = windProfile.getHeadwindComponent(distanceFromStart, altitude);
            const segmentToStep = this.computeCruiseSegment(step.distanceFromStart - distanceFromStart, remainingFuelOnBoard, speed, headwind);
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
            sequence.addCheckpointFromStep(segmentToStep, VerticalCheckpointReason.AtmosphericConditions);

            this.addStepFromLastCheckpoint(sequence, step, stepClimbStrategy, stepDescentStrategy);
        }

        // Once again, we check if there are any speed constraints before the T/D
        for (const speedConstraint of profile.maxClimbSpeedConstraints) {
            // If speed constraint does not lie along the remaining cruise track
            if (speedConstraint.distanceFromStart > topOfDescent.distanceFromStart) {
                continue;
            }

<<<<<<< HEAD
            this.addSegmentToSpeedConstraint(sequence, speedConstraint, speedProfile);
=======
            this.addSegmentToSpeedConstraint(sequence, speedConstraint, speedProfile, windProfile);
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
        }

        const speedTarget = speedProfile.getTarget(
            sequence.lastCheckpoint.distanceFromStart,
            sequence.lastCheckpoint.altitude,
            ManagedSpeedType.Cruise,
        );

        if (speedTarget - sequence.lastCheckpoint.speed > 1) {
            const accelerationStep = this.levelAccelerationStep(
<<<<<<< HEAD
                startOfCruise.remainingFuelOnBoard,
                sequence.lastCheckpoint.speed,
                speedTarget,
=======
                sequence.lastCheckpoint.distanceFromStart,
                sequence.lastCheckpoint.speed,
                speedTarget,
                windProfile.getHeadwindComponent(sequence.lastCheckpoint.distanceFromStart, sequence.lastCheckpoint.distanceFromStart),
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
            );

            sequence.addCheckpointFromStep(accelerationStep, VerticalCheckpointReason.AtmosphericConditions);
        }

        if (topOfDescent.distanceFromStart < sequence.lastCheckpoint.distanceFromStart) {
            console.warn('[FMS/VNAV] An acceleration step in the cruise took us past T/D. This is not implemented properly yet. Blame BBK');
        }

        const { fuelBurned, timeElapsed } = this.computeCruiseSegment(
            topOfDescent.distanceFromStart - sequence.lastCheckpoint.distanceFromStart,
            startOfCruise.remainingFuelOnBoard,
            speedTarget,
<<<<<<< HEAD
=======
            windProfile.getHeadwindComponent(sequence.lastCheckpoint.distanceFromStart, sequence.lastCheckpoint.altitude),
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
        );

        if (sequence.length > 1) {
            profile.addCheckpointAtDistanceFromStart(sequence.at(1).distanceFromStart, ...sequence.get());
        }

        return {
            remainingFuelOnBoardAtTopOfDescent: sequence.lastCheckpoint.remainingFuelOnBoard - fuelBurned,
            secondsFromPresentAtTopOfDescent: sequence.lastCheckpoint.secondsFromPresent + timeElapsed,
        };
    }

<<<<<<< HEAD
    private addSegmentToSpeedConstraint(sequence: TemporaryCheckpointSequence, speedConstraint: MaxSpeedConstraint, speedProfile: SpeedProfile) {
=======
    private addSegmentToSpeedConstraint(sequence: TemporaryCheckpointSequence, speedConstraint: MaxSpeedConstraint, speedProfile: SpeedProfile, windProfile: HeadwindProfile) {
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
        const { distanceFromStart, altitude, remainingFuelOnBoard } = sequence.lastCheckpoint;

        if (speedConstraint.distanceFromStart < distanceFromStart) {
            return;
        }

        const speed = speedProfile.getTarget(distanceFromStart, altitude, ManagedSpeedType.Cruise);
        const segmentResult = this.computeCruiseSegment(
            speedConstraint.distanceFromStart - distanceFromStart,
            remainingFuelOnBoard,
            speed,
<<<<<<< HEAD
=======
            windProfile.getHeadwindComponent(distanceFromStart, altitude),
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
        );

        sequence.addCheckpointFromStep(segmentResult, VerticalCheckpointReason.SpeedConstraint);
    }

    private addStepFromLastCheckpoint(sequence: TemporaryCheckpointSequence, step: Step, stepClimbStrategy: ClimbStrategy, stepDescentStrategy: DescentStrategy) {
        // TODO: What happens if the step is at cruise altitude?
        const { managedCruiseSpeed, managedCruiseSpeedMach } = this.computationParametersObserver.get();
        const { altitude, remainingFuelOnBoard } = sequence.lastCheckpoint;

        const isClimbVsDescent = step.toAltitude > altitude;
        // Instead of just atmospheric conditions, the last checkpoint is now a step climb point
        if (sequence.lastCheckpoint.reason === VerticalCheckpointReason.AtmosphericConditions) {
            sequence.lastCheckpoint.reason = isClimbVsDescent
                ? VerticalCheckpointReason.StepClimb
                : VerticalCheckpointReason.StepDescent;
        }

        const stepResults = isClimbVsDescent
            ? stepClimbStrategy.predictToAltitude(altitude, step.toAltitude, managedCruiseSpeed, managedCruiseSpeedMach, remainingFuelOnBoard, WindComponent.zero())
            : stepDescentStrategy.predictToAltitude(altitude, step.toAltitude, managedCruiseSpeed, managedCruiseSpeed, remainingFuelOnBoard, WindComponent.zero());

        sequence.addCheckpointFromStep(stepResults, isClimbVsDescent ? VerticalCheckpointReason.TopOfStepClimb : VerticalCheckpointReason.BottomOfStepDescent);
    }

<<<<<<< HEAD
    private computeCruiseSegment(distance: NauticalMiles, remainingFuelOnBoard: number, speed: Knots): StepResults {
=======
    private computeCruiseSegment(distance: NauticalMiles, remainingFuelOnBoard: number, speed: Knots, headwind: WindComponent): StepResults {
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
        const { zeroFuelWeight, cruiseAltitude, managedCruiseSpeedMach } = this.computationParametersObserver.get();

        return Predictions.levelFlightStep(
            cruiseAltitude,
            distance,
            speed,
            managedCruiseSpeedMach,
            zeroFuelWeight,
            remainingFuelOnBoard,
<<<<<<< HEAD
            0,
=======
            headwind.value,
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
            this.atmosphericConditions.isaDeviation,
        );
    }

<<<<<<< HEAD
    private levelAccelerationStep(remainingFuelOnBoard: number, speed: Knots, finalSpeed: Knots): StepResults {
=======
    private levelAccelerationStep(remainingFuelOnBoard: number, speed: Knots, finalSpeed: Knots, headwind: WindComponent): StepResults {
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
        const { zeroFuelWeight, cruiseAltitude, managedCruiseSpeedMach, tropoPause } = this.computationParametersObserver.get();

        return Predictions.speedChangeStep(
            0,
            cruiseAltitude,
            speed,
            finalSpeed,
            managedCruiseSpeedMach,
            managedCruiseSpeedMach,
            this.getClimbThrustN1Limit(this.atmosphericConditions, cruiseAltitude, speed),
            zeroFuelWeight,
            remainingFuelOnBoard,
<<<<<<< HEAD
            0,
=======
            headwind.value,
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
            this.atmosphericConditions.isaDeviation,
            tropoPause,
        );
    }

    getFinalCruiseAltitude(): Feet {
        const { cruiseAltitude } = this.computationParametersObserver.get();

        if (this.stepCoordinator.steps.length === 0) {
            return cruiseAltitude;
        }

        return this.stepCoordinator.steps[this.stepCoordinator.steps.length - 1].toAltitude;
    }

    private getClimbThrustN1Limit(atmosphericConditions: AtmosphericConditions, altitude: Feet, speed: Knots) {
        // This Mach number is the Mach number for the predicted climb speed, not the Mach to use after crossover altitude.
        const climbSpeedMach = atmosphericConditions.computeMachFromCas(altitude, speed);
        const estimatedTat = atmosphericConditions.totalAirTemperatureFromMach(altitude, climbSpeedMach);

        return EngineModel.tableInterpolation(EngineModel.maxClimbThrustTableLeap, estimatedTat, altitude);
    }
}
