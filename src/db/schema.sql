CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT TIMESTAMP,
  CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS catalog_domains (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS catalog_subdomains (
  id VARCHAR(36) PRIMARY KEY,
  domain_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT fk_sd_domain FOREIGN KEY (domain_id) REFERENCES catalog_domains(id)
);

CREATE TABLE IF NOT EXISTS catalog_capabilities (
  id VARCHAR(36) PRIMARY KEY,
  subdomain_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT fk_cap_sd FOREIGN KEY (subdomain_id) REFERENCES catalog_subdomains(id)
);

CREATE TABLE IF NOT EXISTS catalog_features (
  id VARCHAR(36) PRIMARY KEY,
  capability_id VARCHAR(36) NOT NULL,
  bcm_id VARCHAR(40) NOT NULL,
  name VARCHAR(255) NOT NULL,
  excerpt CLOB,
  CONSTRAINT fk_feat_cap FOREIGN KEY (capability_id) REFERENCES catalog_capabilities(id)
);

CREATE TABLE IF NOT EXISTS assessments (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT TIMESTAMP,
  CONSTRAINT fk_ass_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_ass_user FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS assessment_answers (
  id VARCHAR(36) PRIMARY KEY,
  assessment_id VARCHAR(36) NOT NULL,
  feature_id VARCHAR(36) NOT NULL,
  in_use VARCHAR(20),
  extent SMALLINT,
  evidence VARCHAR(10),
  notes CLOB,
  process_file_id VARCHAR(36),
  data_file_id VARCHAR(36),
  updated_at TIMESTAMP DEFAULT CURRENT TIMESTAMP,
  CONSTRAINT fk_ans_ass FOREIGN KEY (assessment_id) REFERENCES assessments(id),
  CONSTRAINT fk_ans_feat FOREIGN KEY (feature_id) REFERENCES catalog_features(id)
);

CREATE TABLE IF NOT EXISTS files (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  original_name VARCHAR(512) NOT NULL,
  stored_name VARCHAR(512) NOT NULL,
  mime VARCHAR(255),
  size BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT TIMESTAMP,
  CONSTRAINT fk_file_company FOREIGN KEY (company_id) REFERENCES companies(id)
);
