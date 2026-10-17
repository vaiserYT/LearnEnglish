"""Initial migration

Revision ID: 001
Revises:
Create Date: 2024-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    op.execute("CREATE TYPE userlevel AS ENUM ('beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced')")
    op.execute("CREATE TYPE exercisetype AS ENUM ('conversation', 'role_play', 'story_telling', 'vocabulary', 'pronunciation', 'listening')")

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('level', postgresql.ENUM('beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', name='userlevel'), nullable=True),
        sa.Column('native_language', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create learning_plans table
    op.create_table(
        'learning_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('current_level', postgresql.ENUM('beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', name='userlevel'), nullable=False),
        sa.Column('target_level', postgresql.ENUM('beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', name='userlevel'), nullable=False),
        sa.Column('focus_areas', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('weak_points', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('strong_points', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('next_topics', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('plan_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learning_plans_id'), 'learning_plans', ['id'], unique=False)

    # Create exercises table
    op.create_table(
        'exercises',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('learning_plan_id', sa.Integer(), nullable=False),
        sa.Column('type', postgresql.ENUM('conversation', 'role_play', 'story_telling', 'vocabulary', 'pronunciation', 'listening', name='exercisetype'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('content', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('difficulty', sa.Integer(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=True),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['learning_plan_id'], ['learning_plans.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_exercises_id'), 'exercises', ['id'], unique=False)

    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('topic', sa.String(), nullable=True),
        sa.Column('exercise_type', postgresql.ENUM('conversation', 'role_play', 'story_telling', 'vocabulary', 'pronunciation', 'listening', name='exercisetype'), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('audio_url', sa.String(), nullable=True),
        sa.Column('corrections', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_messages_id'), 'messages', ['id'], unique=False)

    # Create user_progress table
    op.create_table(
        'user_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('total_conversations', sa.Integer(), nullable=True),
        sa.Column('total_messages', sa.Integer(), nullable=True),
        sa.Column('total_hours', sa.Float(), nullable=True),
        sa.Column('vocabulary_size', sa.Integer(), nullable=True),
        sa.Column('fluency_score', sa.Float(), nullable=True),
        sa.Column('pronunciation_score', sa.Float(), nullable=True),
        sa.Column('grammar_score', sa.Float(), nullable=True),
        sa.Column('comprehension_score', sa.Float(), nullable=True),
        sa.Column('streak_days', sa.Integer(), nullable=True),
        sa.Column('last_activity', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_progress_id'), 'user_progress', ['id'], unique=False)

    # Create learned_expressions table
    op.create_table(
        'learned_expressions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('expression', sa.String(), nullable=False),
        sa.Column('translation', sa.String(), nullable=True),
        sa.Column('context', sa.Text(), nullable=True),
        sa.Column('example_sentence', sa.Text(), nullable=True),
        sa.Column('mastery_level', sa.Integer(), nullable=True),
        sa.Column('times_used', sa.Integer(), nullable=True),
        sa.Column('last_used', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learned_expressions_id'), 'learned_expressions', ['id'], unique=False)

    # Create error_records table
    op.create_table(
        'error_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('error_type', sa.String(), nullable=False),
        sa.Column('incorrect_text', sa.Text(), nullable=False),
        sa.Column('correct_text', sa.Text(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('context', sa.Text(), nullable=True),
        sa.Column('times_made', sa.Integer(), nullable=True),
        sa.Column('last_occurred', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('resolved', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_error_records_id'), 'error_records', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_error_records_id'), table_name='error_records')
    op.drop_table('error_records')
    op.drop_index(op.f('ix_learned_expressions_id'), table_name='learned_expressions')
    op.drop_table('learned_expressions')
    op.drop_index(op.f('ix_user_progress_id'), table_name='user_progress')
    op.drop_table('user_progress')
    op.drop_index(op.f('ix_messages_id'), table_name='messages')
    op.drop_table('messages')
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_table('conversations')
    op.drop_index(op.f('ix_exercises_id'), table_name='exercises')
    op.drop_table('exercises')
    op.drop_index(op.f('ix_learning_plans_id'), table_name='learning_plans')
    op.drop_table('learning_plans')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.execute('DROP TYPE exercisetype')
    op.execute('DROP TYPE userlevel')
