/**
 * @export
 * @interface ReportsTechnicianByTrainingCenterType
 */
export interface GeneralReportDto {
    /**
     * @type {string}
     * @memberof CustomDataFormat
     */
    'id'?: string;
    /**
     * @type {string}
     * @memberof CustomDataFormat
     */
    'name'?: string | null;
    /**
     * @type {number}
     * @memberof CustomDataFormat
     */
    'total'?: number;
    /**
     * @type {number}
     * @memberof CustomDataFormat
     */
    'stateEntityId'?: number;
}


/**
 * @export
 * @interface ReportsTechnicianByTrainingCenterType
 */
export interface GeneralReportEntityDto {
    /**
     * @type {string}
     * @memberof CustomDataFormat
     */
    'id'?: string;
    /**
     * @type {string}
     * @memberof CustomDataFormat
     */
    'name'?: string | null;
    /**
     * @type {number}
     * @memberof CustomDataFormat
     */
    'total'?: number;
    /**
     * @type {number}
     * @memberof CustomDataFormat
     */
    'type'?: string;
}