import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, PermissionFlagsBits, GuildMember } from 'discord.js';
import { logger } from '../utils/logger';

const GUILD_ID = '1386130264895520868';
const RECRUITER_ROLE_ID = '1387857527873474560';
const INTERVIEW_CATEGORY_ID = '1387857810149253130'; // You'll need to create this category

export const command = {
  data: new SlashCommandBuilder()
    .setName('application')
    .setDescription('Manage applications')
    .addSubcommand(subcommand =>
      subcommand
        .setName('interview')
        .setDescription('Start an interview for an applicant')
        .addStringOption(option =>
          option.setName('applicant_id')
            .setDescription('Discord ID of the applicant')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('application_id')
            .setDescription('Application ID from the database')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('approve')
        .setDescription('Approve an application')
        .addStringOption(option =>
          option.setName('applicant_id')
            .setDescription('Discord ID of the applicant')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('application_id')
            .setDescription('Application ID from the database')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('deny')
        .setDescription('Deny an application')
        .addStringOption(option =>
          option.setName('applicant_id')
            .setDescription('Discord ID of the applicant')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('application_id')
            .setDescription('Application ID from the database')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Reason for denial (optional)')
            .setRequired(false))),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check if user has recruiter role
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) &&
        !(interaction.member as GuildMember)?.roles.cache.has(RECRUITER_ROLE_ID)) {
      await interaction.reply({
        content: '❌ You do not have permission to manage applications.',
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const applicantId = interaction.options.getString('applicant_id');
    const applicationId = interaction.options.getString('application_id');

    switch (subcommand) {
      case 'interview':
        await handleStartInterview(interaction, applicantId!, applicationId!);
        break;
      case 'approve':
        await handleApproveApplication(interaction, applicantId!, applicationId!);
        break;
      case 'deny':
        const reason = interaction.options.getString('reason') || undefined;
        await handleDenyApplication(interaction, applicantId!, applicationId!, reason);
        break;
    }
  },
};

async function handleStartInterview(interaction: ChatInputCommandInteraction, applicantId: string, applicationId: string) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('❌ This command can only be used in a server.');
      return;
    }

    // Get the applicant member
    const applicant = await guild.members.fetch(applicantId).catch(() => null);
    if (!applicant) {
      await interaction.editReply('❌ Could not find the applicant in this server.');
      return;
    }

    // Generate interview channel name
    const channelName = generateInterviewChannelName(applicant.displayName);

    // Create interview voice channel
    const interviewChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: INTERVIEW_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: applicantId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
        },
        {
          id: RECRUITER_ROLE_ID,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.MoveMembers],
        },
      ],
    });

    // Send notification to applicant
    try {
      await applicant.send({
        embeds: [{
          title: '🎤 Interview Scheduled',
          description: `Your interview for KrakenGaming has been scheduled!\n\nPlease join the voice channel: **${channelName}**\n\nThe interview channel will be available shortly. A recruiter will join you soon.`,
          color: 0x00ff00,
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (error) {
      logger.warn(`Could not send DM to applicant ${applicantId}:`, error);
    }

    // Update application record (you would call your API here)
    // await updateApplicationInterviewChannel(applicationId, interviewChannel.id);

    await interaction.editReply({
      content: `✅ Interview channel created: ${interviewChannel}\n🔔 Applicant ${applicant} has been notified.`,
    });

    logger.info(`Interview channel created for application ${applicationId}: ${interviewChannel.name}`);

  } catch (error) {
    logger.error('Error creating interview channel:', error);
    await interaction.editReply('❌ Failed to create interview channel. Please try again.');
  }
}

async function handleApproveApplication(interaction: ChatInputCommandInteraction, applicantId: string, applicationId: string) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('❌ This command can only be used in a server.');
      return;
    }

    // Get the applicant member
    const applicant = await guild.members.fetch(applicantId).catch(() => null);
    if (!applicant) {
      await interaction.editReply('❌ Could not find the applicant in this server.');
      return;
    }

    // Add member role (you would define this role ID)
    const MEMBER_ROLE_ID = '1234567890123456789'; // Replace with actual member role ID
    await applicant.roles.add(MEMBER_ROLE_ID);

    // Update nickname to add [KG] prefix
    const newNickname = `[KG] ${applicant.displayName}`;
    if (newNickname.length <= 32) { // Discord nickname limit
      await applicant.setNickname(newNickname);
    }

    // Send welcome message
    try {
      await applicant.send({
        embeds: [{
          title: '⚓ Welcome to KrakenGaming!',
          description: `Congratulations! Your application has been **approved**.\n\nYou are now a member of KrakenGaming. Welcome aboard, sailor!\n\n🎉 You now have access to all member channels and features.`,
          color: 0x00ff00,
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (error) {
      logger.warn(`Could not send welcome DM to ${applicantId}:`, error);
    }

    // Clean up application channels
    await cleanupApplicationChannels(guild, applicationId);

    // Update application status (you would call your API here)
    // await updateApplicationStatus(applicationId, 'approved', interaction.user.id);

    await interaction.editReply({
      content: `✅ Application approved! ${applicant} has been welcomed to KrakenGaming.`,
    });

    logger.info(`Application ${applicationId} approved by ${interaction.user.tag}`);

  } catch (error) {
    logger.error('Error approving application:', error);
    await interaction.editReply('❌ Failed to approve application. Please try again.');
  }
}

async function handleDenyApplication(interaction: ChatInputCommandInteraction, applicantId: string, applicationId: string, reason?: string) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('❌ This command can only be used in a server.');
      return;
    }

    // Get the applicant member
    const applicant = await guild.members.fetch(applicantId).catch(() => null);
    if (!applicant) {
      await interaction.editReply('❌ Could not find the applicant in this server.');
      return;
    }

    // Send denial message
    try {
      await applicant.send({
        embeds: [{
          title: '❌ Application Status Update',
          description: `Unfortunately, your application to KrakenGaming has been denied.\n\n${reason ? `**Reason:** ${reason}\n\n` : ''}You may reapply after the cooldown period. Keep improving your Naval Action skills and we hope to see you again soon!`,
          color: 0xff0000,
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (error) {
      logger.warn(`Could not send denial DM to ${applicantId}:`, error);
    }

    // Clean up application channels
    await cleanupApplicationChannels(guild, applicationId);

    // Update application status and set cooldown (you would call your API here)
    // await updateApplicationStatus(applicationId, 'denied', interaction.user.id, reason);
    // await setApplicationCooldown(applicantId, 30); // 30 day cooldown

    await interaction.editReply({
      content: `❌ Application denied. ${applicant} has been notified${reason ? ` (Reason: ${reason})` : ''}.`,
    });

    logger.info(`Application ${applicationId} denied by ${interaction.user.tag}${reason ? `, reason: ${reason}` : ''}`);

  } catch (error) {
    logger.error('Error denying application:', error);
    await interaction.editReply('❌ Failed to deny application. Please try again.');
  }
}

function generateInterviewChannelName(displayName: string): string {
  // Clean the display name and create interview channel name
  const cleanName = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 20) // Leave room for "Interview: " prefix
    .replace(/^-|-$/g, '');

  return `Interview: ${cleanName}`;
}

async function cleanupApplicationChannels(guild: any, applicationId: string) {
  try {
    // Find and delete application channels related to this application
    const channels = guild.channels.cache.filter((channel: any) =>
      (channel.name.includes('app-') || channel.name.includes('Interview:')) &&
      channel.topic?.includes(applicationId)
    );

    for (const channel of channels.values()) {
      await channel.delete('Application processed');
      logger.info(`Deleted application channel: ${channel.name}`);
    }
  } catch (error) {
    logger.warn('Error cleaning up application channels:', error);
  }
}

export default command;
