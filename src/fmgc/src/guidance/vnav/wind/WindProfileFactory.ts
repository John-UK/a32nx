import { Fmgc } from '@fmgc/guidance/GuidanceController';
import { VerticalProfileComputationParametersObserver } from '@fmgc/guidance/vnav/VerticalProfileComputationParameters';
import { ClimbWindProfile } from '@fmgc/guidance/vnav/wind/ClimbWindProfile';
<<<<<<< HEAD
=======
import { CruiseWindProfile } from '@fmgc/guidance/vnav/wind/CruiseWindProfile';
>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
import { DescentWindProfile } from '@fmgc/guidance/vnav/wind/DescentWindProfile';
import { WindForecastInputObserver } from '@fmgc/guidance/vnav/wind/WindForecastInputObserver';
import { WindObserver } from '@fmgc/guidance/vnav/wind/WindObserver';

export class WindProfileFactory {
    private windObserver: WindObserver;

    private windInputObserver: WindForecastInputObserver;

    private aircraftDistanceFromStart: NauticalMiles;

    constructor(private parameterObserver: VerticalProfileComputationParametersObserver, fmgc: Fmgc, fmgcSide: number) {
        this.windObserver = new WindObserver(fmgcSide);
        this.windInputObserver = new WindForecastInputObserver(fmgc);
    }

    updateFmgcInputs() {
        this.windInputObserver.update();
    }

    updateAircraftDistanceFromStart(distanceFromStart: NauticalMiles) {
        this.aircraftDistanceFromStart = distanceFromStart;
    }

    getClimbWinds(): ClimbWindProfile {
        return new ClimbWindProfile(
            this.parameterObserver,
            this.windInputObserver.get(),
            this.windObserver,
            this.aircraftDistanceFromStart,
        );
    }

<<<<<<< HEAD
=======
    getCruiseWinds(): CruiseWindProfile {
        return new CruiseWindProfile(
            this.parameterObserver,
            this.windInputObserver.get(),
            this.windObserver,
            this.aircraftDistanceFromStart,
        );
    }

>>>>>>> b8f1a6e480490f0dcab83c92369e74f1c82140c0
    getDescentWinds(): DescentWindProfile {
        return new DescentWindProfile(
            this.parameterObserver,
            this.windInputObserver.get(),
            this.windObserver,
            this.aircraftDistanceFromStart,
        );
    }
}
