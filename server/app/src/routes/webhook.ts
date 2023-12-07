import { Response, Request } from "express";
import Router from "express-promise-router";
import status from "http-status";
import { Config } from "../shared/config";
import { metriportClient } from "../shared/metriport-api";

const router = Router();

/** ---------------------------------------------------------------------------
 * POST /webhook
 *
 * Example route to store info from webhooks
 *
 * @param   {string}  req.header.x-webhook-key  The webhook key.
 * @param   {obj}  req.body.users  The users data.
 *
 * @return  {status}
 */
router.post("/", async (req: Request, res: Response) => {
  if (
    !metriportClient.verifyWebhookSignature(
      Config.getMetriportWebhookKey(),
      req.body,
      String(req.headers["x-metriport-signature"])
    )
  ) {
    return res.sendStatus(status.UNAUTHORIZED);
  }

  if (req.body.ping) {
    console.log(`Sending 200 | OK + 'pong' body param`);
    return res.status(status.OK).json({ pong: req.body.ping });
  }

  if (req.body.meta.type === "medical.document-download") {
    console.log(`Received document download webhook`);
    const patient = req.body.patients[0];

    if (patient.status === "completed") {
      const documents = req.body.patients[0].documents;

      if (documents.length > 0) {
        const firstDoc = documents[0];

        // DOWNLOAD THE DOCUMENT
        // Expected response https://docs.metriport.com/medical-api/api-reference/document/get-document#response
        const resp = await metriportClient.getDocumentUrl(
          firstDoc.fileName,
          "pdf"
        );

        console.log(`got download URL ${resp.url}`);
        // await downloadFile(resp.url, firstDoc.fileName, "pdf");
      }
    } else {
      console.log("Error querying documents");
    }
  }

  if (req.body.meta.type === "medical.document-conversion") {
    console.log(`Received document conversion webhook`);
    const patient = req.body.patients[0];

    if (patient.status === "completed") {
      const patientId = patient.patientId;

      // START A CONSOLIDATED QUERY
      // Expected response https://docs.metriport.com/medical-api/api-reference/fhir/consolidated-data-query-post#response
      await metriportClient.startConsolidatedQuery(patientId);
    } else {
      console.log("Error converting documents");
    }
  }

  if (req.body.meta.type === "medical.consolidated-data") {
    console.log(`Received consolidated data webhook`);
    const patient = req.body.patients[0];

    if (patient.status === "completed") {
      console.log(JSON.stringify(req.body, undefined, 2));
    } else {
      console.log("Error consolidating data");
    }
  }

  return res.sendStatus(status.OK);
});

export default router;
