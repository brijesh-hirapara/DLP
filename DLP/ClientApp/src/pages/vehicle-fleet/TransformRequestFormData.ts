export interface QuestionnaireItem {
  id: string;
  requestId: string;
  requestType: string;
  questionNo: number;
  values: number;
  codebookId: string | null;
  trailerQTY: number;
  countryId: string | null;
}

export const TransformVehicleFleetRequestFormData = (data: Record<string, any>) => {
    const QuestionnaireListJson: QuestionnaireItem[] = [];
  
    // Helper to push items safely
    const pushItem = (
      questionNo: number,
      values = 0,
      codebookId: string | null = null,
      trailerQTY = 0,
      countryId: string | null = null
    ) => {
      QuestionnaireListJson.push({
        id: "",
        requestId: "",
        requestType: data.type,
        questionNo,
        values,
        codebookId,
        trailerQTY,
        countryId,
      });
    };
  
    // 1️⃣ Total number of vehicles
    if (data.question_1_values !== undefined) {
      pushItem(1, Number(data.question_1_values) || 0);
    }
  
    // 2️⃣ Trailers by type (array)
    if (Array.isArray(data.trailers)) {
      data.trailers.forEach((item: any) => {
        if (item.question_2_codebookId || item.question_2_trailerQTY) {
          pushItem(
            2,
            0,
            item.question_2_codebookId || null,
            Number(item.question_2_trailerQTY) || 0
          );
        }
      });
    }
  
    // 3️⃣ CEMT permits (array)
    if (Array.isArray(data.cemtPermits)) {
      data.cemtPermits.forEach((item: any) => {
        if (item.question_3_codebookId || item.question_3_countryId) {
          pushItem(3, 0, item.question_3_codebookId || null, 0, item.question_3_countryId || null);
        }
      });
    }
  
    // 4️⃣ Certifications and licenses (multi-select)
    if (Array.isArray(data.question_4_codebookId)) {
      data.question_4_codebookId.forEach((id: string) => {
        pushItem(4, 0, id);
      });
    }
  
    // 5️⃣ Countries of operation (multi-select)
    if (Array.isArray(data.question_5_countryId)) {
      data.question_5_countryId.forEach((id: string) => {
        pushItem(5, 0, null, 0, id);
      });
    }
  
    // Filter out non-question fields for submission
    const rest = Object.fromEntries(
      Object.entries(data).filter(
        ([key]) =>
          !key.startsWith("question_") &&
          key !== "trailers" &&
          key !== "cemtPermits"
      )
    );
  
    return {
      ...rest,
      QuestionnaireListJson,
    };
  };
  