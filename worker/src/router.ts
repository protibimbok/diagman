import { RouterType } from 'itty-router';
import { Env } from './worker';
import JSONResponse from './utils/Response';
import { addTest, listTests } from './routes/med-test';
import { addPatientTest, listPatientTests } from './routes/patient-test';

export interface RequestEvent {
	request: Request;
	env: Env;
	res: JSONResponse;
	method: Request['method'];
	url: Request['url'];
}
export type RequestHandler = (event: RequestEvent) => Record<string, any> | undefined;

export const buildRouter = (router: RouterType) => {
	router.post('/tests', addTest);
	router.get('/tests', listTests);

	router.post('/patient-tests', addPatientTest);
	router.get('/patient-tests', listPatientTests);
};
export default buildRouter;
