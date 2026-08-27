
import { pgTable, text, timestamp, boolean, jsonb, integer, serial, date, primaryKey } from 'drizzle-orm/pg-core';

// --- Users ---
export const users = pgTable('users', {
    id: text('id').primaryKey(), // Firebase UID or similar
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    role: text('role').notNull().default('student'), // 'student', 'teacher', 'parent'
    avatar: text('avatar'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Materials ---
export const materials = pgTable('materials', {
    id: text('id').primaryKey(), // We can use slugs like 'math-101'
    title: text('title').notNull(),
    description: text('description').notNull(),
    subject: text('subject').notNull(),
    content: text('content'), // Markdown content
    type: text('type').notNull().default('document'), // 'video', 'pdf', 'document'
    url: text('url'), // For external links or video URLs
    prerequisites: jsonb('prerequisites'), // Array of { materialId, requiredQuizScore }
    published: boolean('published').default(false).notNull(),
    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Quizzes ---
export const quizzes = pgTable('quizzes', {
    id: text('id').primaryKey(),
    materialId: text('material_id').references(() => materials.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    questions: jsonb('questions').notNull(), // Array of Question objects
    timeLimit: integer('time_limit'), // in minutes
    passingScore: integer('passing_score').default(70).notNull(),
    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Student Progress ---
export const progress = pgTable('progress', {
    id: serial('id').primaryKey(),
    studentId: text('student_id').references(() => users.id).notNull(),
    materialId: text('material_id').references(() => materials.id).notNull(),
    completed: boolean('completed').default(false).notNull(),
    progress: integer('progress').default(0).notNull(), // 0-100
    quizScores: jsonb('quiz_scores'), // Array of score history
    lastAccessed: timestamp('last_accessed').defaultNow(),
    timeSpent: integer('time_spent').default(0), // in minutes
});

// --- Resources/Mindmaps (Extra) ---
export const mindmaps = pgTable('mindmaps', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    subject: text('subject'),
    nodes: jsonb('nodes').notNull(), // The complex node structure
    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Cita-citaku Events ---
export const citacitakuEvents = pgTable('citacitaku_events', {
    id: text('id').primaryKey(),
    eventType: text('event_type').notNull(),
    inputJson: jsonb('input_json').notNull(),
    outputJson: jsonb('output_json').notNull(),
    metadataJson: jsonb('metadata_json').default({}).notNull(),
    consentAccepted: boolean('consent_accepted'),
    consentVersion: text('consent_version'),
    consentText: text('consent_text'),
    provider: text('provider'),
    model: text('model'),
    status: text('status').default('completed').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const citacitakuGuidanceCache = pgTable('citacitaku_guidance_cache', {
    cacheKey: text('cache_key').primaryKey(),
    cacheDate: date('cache_date').notNull(),
    dreamNormalized: text('dream_normalized').notNull(),
    grade: text('grade').notNull(),
    responseJson: jsonb('response_json').notNull(),
    metadataJson: jsonb('metadata_json').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const citacitakuGenerationLocks = pgTable('citacitaku_generation_locks', {
    cacheKey: text('cache_key').primaryKey(),
    ownerId: text('owner_id').notNull(),
    leaseExpiresAt: timestamp('lease_expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const citacitakuProviderSlots = pgTable('citacitaku_provider_slots', {
    provider: text('provider').notNull(),
    slotNumber: integer('slot_number').notNull(),
    ownerId: text('owner_id'),
    leaseExpiresAt: timestamp('lease_expires_at', { withTimezone: true }),
    acquiredAt: timestamp('acquired_at', { withTimezone: true }),
}, (table) => [primaryKey({ columns: [table.provider, table.slotNumber] })]);

export const citacitakuRateLimitBuckets = pgTable('citacitaku_rate_limit_buckets', {
    bucketKey: text('bucket_key').primaryKey(),
    requestCount: integer('request_count').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const citacitakuScholarships = pgTable('citacitaku_scholarships', {
    id: text('id').primaryKey(),
    sourceSheet: text('source_sheet').notNull(),
    level: text('level').notNull(),
    scholarship: text('scholarship').notNull(),
    provider: text('provider'),
    destination: text('destination'),
    type: text('type'),
    status: text('status'),
    applicationWindow: text('application_window'),
    fundingLevel: text('funding_level'),
    coverage: text('coverage'),
    eligibleMajors: text('eligible_majors'),
    keyEligibility: text('key_eligibility'),
    language: text('language'),
    admissionOfferFirst: text('admission_offer_first'),
    ageLimit: text('age_limit'),
    bondReturnObligation: text('bond_return_obligation'),
    recommendedAction: text('recommended_action'),
    officialSourceUrl: text('official_source_url'),
    sourceQuality: text('source_quality'),
    lastChecked: date('last_checked'),
    historical: boolean('historical').default(false).notNull(),
    searchableText: text('searchable_text').default('').notNull(),
    rawJson: jsonb('raw_json').default({}).notNull(),
    importedAt: timestamp('imported_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const citacitakuScholarshipFieldGuides = pgTable('citacitaku_scholarship_field_guides', {
    id: text('id').primaryKey(),
    scholarship: text('scholarship').notNull(),
    fieldGroup: text('field_group'),
    majorsSubjects: text('majors_subjects'),
    importantNotes: text('important_notes'),
    officialSourceUrl: text('official_source_url'),
    searchableText: text('searchable_text').default('').notNull(),
    importedAt: timestamp('imported_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Cita-citaku Education RAG ---
export const citacitakuRagDocuments = pgTable('citacitaku_rag_documents', {
    id: text('id').primaryKey(),
    fileName: text('file_name').notNull(),
    sourceType: text('source_type').notNull(),
    contentHash: text('content_hash').notNull(),
    pageCount: integer('page_count'),
    metadataJson: jsonb('metadata_json').default({}).notNull(),
    importedAt: timestamp('imported_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const citacitakuRagCareers = pgTable('citacitaku_rag_careers', {
    careerId: text('career_id').primaryKey(),
    titleId: text('title_id').notNull(),
    titleEn: text('title_en').notNull(),
    cluster: text('cluster').notNull(),
    clusterEn: text('cluster_en'),
    coverageStatus: text('coverage_status'),
    aliasesJson: jsonb('aliases_json').default([]).notNull(),
    whatTheyDo: text('what_they_do').notNull(),
    whatTheyDoEn: text('what_they_do_en'),
    primaryMajorsJson: jsonb('primary_majors_json').default([]).notNull(),
    primaryMajorsEnJson: jsonb('primary_majors_en_json').default([]).notNull(),
    alternativeMajorsJson: jsonb('alternative_majors_json').default([]).notNull(),
    alternativeMajorsEnJson: jsonb('alternative_majors_en_json').default([]).notNull(),
    coreSkillsJson: jsonb('core_skills_json').default([]).notNull(),
    coreSkillsEnJson: jsonb('core_skills_en_json').default([]).notNull(),
    schoolSubjectsJson: jsonb('school_subjects_json').default([]).notNull(),
    schoolSubjectsEnJson: jsonb('school_subjects_en_json').default([]).notNull(),
    portfolioExample: text('portfolio_example'),
    portfolioExampleEn: text('portfolio_example_en'),
    entryRouteType: text('entry_route_type'),
    regulatedProfession: boolean('regulated_profession').default(false).notNull(),
    regulatedKey: text('regulated_key'),
    regulatedNote: text('regulated_note'),
    regulatedNoteEn: text('regulated_note_en'),
    sourceIds: text('source_ids'),
    lastChecked: date('last_checked'),
    searchableText: text('searchable_text').default('').notNull(),
    importedAt: timestamp('imported_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const citacitakuRagCareerAliases = pgTable('citacitaku_rag_career_aliases', {
    aliasNormalized: text('alias_normalized').primaryKey(),
    careerId: text('career_id').references(() => citacitakuRagCareers.careerId).notNull(),
    canonicalTitle: text('canonical_title').notNull(),
    canonicalTitleEn: text('canonical_title_en'),
    cluster: text('cluster').notNull(),
    clusterEn: text('cluster_en'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const citacitakuRagCareerRoutes = pgTable('citacitaku_rag_career_routes', {
    careerId: text('career_id').references(() => citacitakuRagCareers.careerId).notNull(),
    routeNo: integer('route_no').notNull(),
    routeName: text('route_name').notNull(),
    routeNameEn: text('route_name_en'),
    routeType: text('route_type').notNull(),
    routeDescription: text('route_description').notNull(),
    routeDescriptionEn: text('route_description_en'),
    careerTitle: text('career_title').notNull(),
    careerTitleEn: text('career_title_en'),
    cluster: text('cluster').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.careerId, table.routeNo] })]);

export const citacitakuRagCareerAnswers = pgTable('citacitaku_rag_career_answers', {
    careerId: text('career_id').references(() => citacitakuRagCareers.careerId).notNull(),
    grade: text('grade').notNull(),
    careerTitle: text('career_title').notNull(),
    careerTitleEn: text('career_title_en'),
    answerJson: jsonb('answer_json').notNull(),
    routeCount: integer('route_count').notNull(),
    weeklyActionCount: integer('weekly_action_count').notNull(),
    sourceIds: text('source_ids'),
    lastChecked: date('last_checked'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.careerId, table.grade] })]);

export const citacitakuRagChunks = pgTable('citacitaku_rag_chunks', {
    chunkId: text('chunk_id').primaryKey(),
    documentId: text('document_id').references(() => citacitakuRagDocuments.id).notNull(),
    chunkType: text('chunk_type').notNull(),
    language: text('language'),
    careerId: text('career_id'),
    grade: text('grade'),
    cluster: text('cluster'),
    title: text('title'),
    chunkText: text('chunk_text').notNull(),
    metadataJson: jsonb('metadata_json').default({}).notNull(),
    sourceIds: text('source_ids'),
    pageNumber: integer('page_number'),
    lastChecked: date('last_checked'),
    importedAt: timestamp('imported_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const citacitakuRagSources = pgTable('citacitaku_rag_sources', {
    sourceId: text('source_id').primaryKey(),
    sourceName: text('source_name').notNull(),
    officialUrl: text('official_url').notNull(),
    howUsed: text('how_used'),
    freshnessClass: text('freshness_class'),
    lastChecked: date('last_checked'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const citacitakuRagCoverageAdded = pgTable('citacitaku_rag_coverage_added', {
    careerId: text('career_id').primaryKey(),
    titleId: text('title_id').notNull(),
    titleEn: text('title_en').notNull(),
    clusterId: text('cluster_id').notNull(),
    clusterEn: text('cluster_en').notNull(),
    sourceIds: text('source_ids'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const citacitakuRagRegulatedProfessions = pgTable('citacitaku_rag_regulated_professions', {
    careerId: text('career_id').primaryKey(),
    titleId: text('title_id').notNull(),
    titleEn: text('title_en').notNull(),
    regulatedKey: text('regulated_key').notNull(),
    regulatedNoteId: text('regulated_note_id').notNull(),
    regulatedNoteEn: text('regulated_note_en').notNull(),
    sourceIds: text('source_ids'),
    lastChecked: date('last_checked'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
