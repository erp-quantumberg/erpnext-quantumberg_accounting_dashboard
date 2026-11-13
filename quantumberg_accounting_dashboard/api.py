import frappe
from frappe import _


@frappe.whitelist()
def set_default_company(company: str) -> str:
	"""Set the logged-in user's default Company."""
	if not company or not frappe.db.exists("Company", company):
		frappe.throw(_("Company {0} does not exist.").format(company))

	if not frappe.has_permission("Company", "read", doc=company):
		frappe.throw(_("You do not have permission to use this Company."), frappe.PermissionError)

	frappe.defaults.set_user_default("Company", company)
	return company


@frappe.whitelist()
def set_user_language(language: str) -> str:
	"""Set the language of the logged-in user."""
	if not language or not frappe.db.exists("Language", language):
		frappe.throw(_("Language {0} is not available.").format(language))

	if not frappe.db.get_value("Language", language, "enabled"):
		frappe.throw(_("Language {0} is disabled.").format(language))

	frappe.db.set_value(
		"User", frappe.session.user, "language", language, update_modified=False
	)
	frappe.clear_cache(user=frappe.session.user)
	return language
