import { Response, Request } from "express";
import Router from "express-promise-router";
import status from "http-status";
import { metriportClient } from "../shared/metriport-api";
import { USState } from "@metriport/api-sdk";

const router = Router();

/** ---------------------------------------------------------------------------
 * POST /patient
 *
 * Example route that registers an example patient, and kicks off the doc query for that patient.
 *
 * @return  {status}
 */
router.post("/", async (_: Request, res: Response) => {
  try {
    const facilityId = "UUID";
    // CREATE A PATIENT
    // Expected response https://docs.metriport.com/medical-api/api-reference/patient/create-patient#response
    const patient = await metriportClient.createPatient(
      {
        firstName: "Jose",
        lastName: "Juarez",
        dob: "1951-05-05",
        genderAtBirth: "M",
        personalIdentifiers: [
          {
            type: "driversLicense",
            state: USState.CA,
            value: "51227265",
          },
        ],
        address: [
          {
            zip: "12345",
            city: "San Diego",
            state: USState.CA,
            country: "USA",
            addressLine1: "Guadalajara Street",
          },
        ],
        contact: [
          {
            phone: "1234567899",
            email: "jose@domain.com",
          },
        ],
        externalId: "123456789",
      },
      facilityId
    );

    // START A DOCUMENT QUERY
    // Expected response https://docs.metriport.com/medical-api/api-reference/document/start-document-query#response
    const resp = await metriportClient.startDocumentQuery(
      patient.id,
      facilityId
    );

    console.log(resp);
  } catch (error) {
    console.log(error);
    return res.sendStatus(status.INTERNAL_SERVER_ERROR);
  }

  return res.sendStatus(status.OK);
});

export default router;
