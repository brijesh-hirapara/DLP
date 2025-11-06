/**
 * Transport request model for creating or updating transport templates.
 * @export
 * @interface TransportRequest
 */
export interface TransportRequest {
    /**
     * 
     * @type {number}
     * @memberof TransportRequest
     */
    readonly accessibility?: number;

    /**
     * 
     * @type {number}
     * @memberof TransportRequest
     */
    readonly totalDistance?: number;

    /**
     * 
     * @type {boolean}
     * @memberof TransportRequest
     */
    readonly isTemplate?: boolean;

    /**
     * 
     * @type {string}
     * @memberof TransportRequest
     */
    readonly templateName?: string;

        /**
     * 
     * @type {string}
     * @memberof TransportRequest
     */
        readonly templateId?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportRequest
     */
    readonly trasportRequestId?: string;

    /**
     * 
     * @type {TransportLocation}
     * @memberof TransportRequest
     */
    readonly transportPickup?: TransportLocation;

    /**
     * 
     * @type {TransportLocation}
     * @memberof TransportRequest
     */
    readonly transportDelivery?: TransportLocation;

    /**
     * 
     * @type {TransportGoods}
     * @memberof TransportRequest
     */
    readonly transportGoods?: TransportGoods;

    /**
     * 
     * @type {TransportInformation}
     * @memberof TransportRequest
     */
    readonly transportInformation?: TransportInformation;
}

/**
 * Pickup or delivery location details.
 * @export
 * @interface TransportLocation
 */
export interface TransportLocation {
    /**
     * 
     * @type {string}
     * @memberof TransportLocation
     */
    readonly id?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportLocation
     */
    readonly companyName?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportLocation
     */
    readonly countryId?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportLocation
     */
    readonly city?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportLocation
     */
    readonly companyAddress?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportLocation
     */
    readonly postalCode?: string;
}

/**
 * Goods details for the transport request.
 * @export
 * @interface TransportGoods
 */
export interface TransportGoods {
    /**
     * 
     * @type {string}
     * @memberof TransportGoods
     */
    readonly id?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportGoods
     */
    readonly typeOfGoodsId?: string;

    /**
     * 
     * @type {number}
     * @memberof TransportGoods
     */
    readonly quantity?: number;

    /**
     * 
     * @type {number}
     * @memberof TransportGoods
     */
    readonly length?: number;

    /**
     * 
     * @type {number}
     * @memberof TransportGoods
     */
    readonly width?: number;

    /**
     * 
     * @type {number}
     * @memberof TransportGoods
     */
    readonly height?: number;

    /**
     * 
     * @type {number}
     * @memberof TransportGoods
     */
    readonly weight?: number;

    /**
     * 
     * @type {boolean}
     * @memberof TransportGoods
     */
    readonly isIncludesAdrGoods?: boolean;

    /**
     * 
     * @type {boolean}
     * @memberof TransportGoods
     */
    readonly isCargoNotStackable?: boolean;
}

/**
 * Information about transport scheduling and currency.
 * @export
 * @interface TransportInformation
 */
export interface TransportInformation {
    /**
     * 
     * @type {string}
     * @memberof TransportInformation
     */
    readonly id?: string;

    /**
     * 
     * @type {number}
     * @memberof TransportInformation
     */
    readonly dateSelectionOption?: number;

    /**
     * 
     * @type {string}
     * @memberof TransportInformation
     */
    readonly pickupDateFrom?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportInformation
     */
    readonly pickupDateTo?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportInformation
     */
    readonly pickupTimeFrom?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportInformation
     */
    readonly pickupTimeTo?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportInformation
     */
    readonly deliveryDateFrom?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportInformation
     */
    readonly deliveryDateTo?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportInformation
     */
    readonly deliveryTimeFrom?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportInformation
     */
    readonly deliveryTimeTo?: string;

    /**
     * 
     * @type {string}
     * @memberof TransportInformation
     */
    readonly currencyId?: string;
}
