/* tslint:disable */
/* eslint-disable */

/**
 * MVP PROJECT API
 * Updated DTO for Questionnaires
 * Represents a single questionnaire entry within a registration request
 */
export interface QuestionnairesDto {
    /**
     * Unique identifier of the questionnaire record
     * @type {string}
     */
    id?: string;
  
    /**
     * Related request identifier (like "2025-0078")
     * @type {string}
     */
    requestId?: string;
  
    /**
     * Type of request (e.g., "RegisterAsShipper")
     * @type {string}
     */
    requestType?: string;
  
    /**
     * Question number (e.g., 1 = How often do you ship?)
     * @type {number}
     */
    questionNo?: number;
  
    /**
     * Numeric or boolean-like answer (0/1 etc.)
     * @type {number}
     */
    values?: number;
  
    /**
     * Linked codebook ID (if any)
     * @type {string | null}
     */
    codebookId?: string | null;
  
    /**
     * Name of the selected codebook value (e.g., "Machinery (MCH)")
     * @type {string | null}
     */
    codebookName?: string | null;
  
    /**
     * Number of trailers or shipment quantity
     * @type {number}
     */
    trailerQTY?: number;
  
    /**
     * Linked country ID (if applicable)
     * @type {string | null}
     */
    countryId?: string | null;
  
    /**
     * Name of the country (if applicable)
     * @type {string | null}
     */
    countryName?: string | null;
  }
  