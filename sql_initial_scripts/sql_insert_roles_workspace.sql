INSERT INTO public.workspace_roles(
	name, 
	description, 
	permissions)
	VALUES (
	'administrator', 
	'Full administrative access to the workspace', 
	'{create,edit,delete,publish,approve,manage_users,manage_settings}');	

INSERT INTO public.workspace_roles(
	name, 
	description, 
	permissions)
	VALUES (
	'creator', 
	'Can create and edit posts', 
	'{create,edit}');		

INSERT INTO public.workspace_roles(
	name, 
	description, 
	permissions)
	VALUES (
	'publisher', 
	'Can publish posts to social media platforms', 
	'{publish}');		

INSERT INTO public.workspace_roles(
	name, 
	description, 
	permissions)
	VALUES (
	'approver', 
	'Can approve posts for publication', 
	'{approve}');

INSERT INTO public.workspace_roles(
	name, 
	description, 
	permissions)
	VALUES (
	'readonly', 
	'Read-only access to workspace content', 
	'{read}');


	