import { z } from 'zod';
import { getLibsqlClient, getUpdateQuery, insertRow } from '../db/conn';
import { reportSchema } from '../forms/patients';
import { RequestHandler } from '../router';
import { validateFormData, validateObject } from '../utils/helpers';

export const finalizeReport: RequestHandler = async ({ request, env, res, user }) => {
	const data = await validateFormData(request, reportSchema);
	const db = getLibsqlClient(env);
	const { rows } = await db.execute({
		sql: `SELECT p.*, r.locked, r.id AS rid FROM \`patients\` AS p LEFT JOIN \`reports\` AS r ON r.id = p.id WHERE p.id=? LIMIT 1`,
		args: [data.id],
	});
	if (rows.length === 0) {
		res.error('Invalid patient!', 404);
	}

	const patient = rows[0];

	if (patient.type === 'cyto') {
		// prettier-ignore
		await validateObject(data, z.object({
			aspiration_note: z.string().nonempty()
		}));
	} else {
		// prettier-ignore
		await validateObject(data, z.object({
			gross_examination: z.string().nonempty()
		}));
	}

	if (patient.rid) {
		if (patient.locked && user!.role !== 'admin') {
			res.error("This report is locked, you don't have permission to update this!", 403);
		}
		const { sql, args } = getUpdateQuery('reports', data);
		args.push(patient.id as any);
		await db.execute({
			sql: sql + ` WHERE id = ?`,
			args,
		});
		res.setMsg('Report updated successfully!');
	} else {
		await Promise.all([
			insertRow(db, 'reports', data),
			db.execute({
				sql: 'UPDATE `patients` SET status = "complete" WHERE id = ?',
				args: [data.id],
			}),
		]);
		res.setMsg('Report added successfully!');
	}
	res.setRows([
		{
			locked: !!data.locked,
		},
	]);
};

export const getReport: RequestHandler = async ({ env, params, res }) => {
	const db = getLibsqlClient(env);
	const { rows } = await db.execute({
		sql: `
		  SELECT *,
		    (
			  SELECT
				GROUP_CONCAT(tests.name, ', ')
			  FROM tests
			  WHERE EXISTS (
				SELECT * 
				FROM json_each(p.tests) 
				WHERE json_each.value = tests.id
			  )
		    ) as test_names
		  FROM \`patients\` AS p
		  LEFT JOIN \`reports\` AS r ON r.id = p.id
		  WHERE p.id=? LIMIT 1
		`,
		args: [decodeURIComponent(params.id)],
	});
	if (rows.length === 0) {
		res.error('The patient does not exist!', 404);
	}
	res.setRows(rows);
};

export const toggleReportLock: RequestHandler = async ({ env, params, res }) => {
	const db = getLibsqlClient(env);
	const { rows } = await db.execute({
		sql: `SELECT p.*, r.locked, r.id AS rid FROM \`patients\` AS p LEFT JOIN \`reports\` AS r ON r.id = p.id WHERE p.id=? LIMIT 1`,
		args: [params.id],
	});
	if (rows.length === 0) {
		res.error('Invalid patient!', 404);
	}

	const patient = rows[0];

	const data = {
		locked: patient.locked ? 0 : 1,
	};

	if (patient.rid) {
		const { sql, args } = getUpdateQuery('reports', data);
		args.push(patient.id as any);
		await db.execute({
			sql: sql + ` WHERE id = ?`,
			args,
		});
	} else {
		res.error('Please add the report first!');
	}
	res.setMsg(`Report ${data.locked ? 'locked' : 'unlocked'} successfully!`);
};

export const deliverReport: RequestHandler = async ({ res, env, params }) => {
	const db = getLibsqlClient(env);
	const { rows } = await db.execute({
		sql: `SELECT * FROM \`patients\` WHERE id=? LIMIT 1`,
		args: [params.id],
	});
	if (rows.length === 0) {
		res.error('Invalid patient!', 404);
	}
	if (rows[0].status !== 'complete') {
		res.error('Please add report first!');
	}
	await db.execute({
		sql: 'UPDATE `patients` SET status = "delivered" WHERE id = ?',
		args: [params.id],
	});
	res.setMsg(`Report delivered successfully!`);
};
