import RequestHandler from "../../core/request.handler";
export default class CalcPriceHandler extends RequestHandler {
    GET(): Promise<{
        id: number;
        mdfPrice: number;
        highglassPrice: number;
        vacuumPrice: number;
        colorPrice: number;
        fridgeCost: number;
        dishwasherCost: number;
        laundryCost: number;
        wallCabinetCost: number;
        wallCabinetSteppedCost: number;
        hoodCost: number;
        hoodHiddenCost: number;
        ovenCost: number;
        ovenBuiltInCost: number;
        updatedAt: Date;
    }>;
    PUT(): Promise<void>;
}
