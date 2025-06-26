import { Client, ButtonInteraction, ChannelType, PermissionFlagsBits, GuildMember } from 'discord.js';
import { logger } from '../utils/logger';

const RECRUITER_ROLE_ID = '1387857527873474560';
const INTERVIEW_CATEGORY_ID = '1387857810149253130'; // You'll need to create this category

export class ApplicationButtonHandler {
  constructor(private client: Client) {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;

      // Handle application-related button clicks
      if (interaction.customId.startsWith('interview_')) {
        await this.handleInterviewButton(interaction);
      }
    });
  }

  private async handleInterviewButton(interaction: ButtonInteraction) {
    try {
      // Check if user has recruiter role
      const member = interaction.member as GuildMember;
      if (!member?.roles.cache.has(RECRUITER_ROLE_ID)) {
        await interaction.reply({
          content: '❌ You do not have permission to start interviews.',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      // Extract application ID from custom_id
      const applicationId = interaction.customId.replace('interview_', '');

      // Get the original application embed to extract applicant info
      const message = interaction.message;
      const embed = message.embeds[0];

      if (!embed || !embed.fields) {
        await interaction.editReply('❌ Could not find application information.');
        return;
      }

      // Extract applicant ID from the mention in the embed
      const applicantField = embed.fields.find(field => field.name === 'Applicant');
      if (!applicantField) {
        await interaction.editReply('❌ Could not find applicant information.');
        return;
      }

      const applicantMatch = applicantField.value.match(/<@(\d+)>/);
      if (!applicantMatch) {
        await interaction.editReply('❌ Could not parse applicant ID.');
        return;
      }

      const applicantId = applicantMatch[1];
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
      const channelName = this.generateInterviewChannelName(applicant.displayName);

      // Check if interview channel already exists
      const existingChannel = guild.channels.cache.find(
        channel => channel.name === channelName && channel.type === ChannelType.GuildVoice
      );

      if (existingChannel) {
        await interaction.editReply({
          content: `ℹ️ Interview channel already exists: ${existingChannel}`,
        });
        return;
      }

      // Create interview voice channel
      const interviewChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: INTERVIEW_CATEGORY_ID,
        topic: `Interview for application ${applicationId}`,
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
            description: `Your interview for KrakenGaming has been scheduled!\n\nPlease join the voice channel: **${channelName}**\n\nA recruiter will join you soon to conduct your interview.`,
            color: 0x00ff00,
            timestamp: new Date().toISOString(),
            footer: {
              text: `Application ID: ${applicationId}`,
            },
          }],
        });
      } catch (error) {
        logger.warn(`Could not send DM to applicant ${applicantId}:`, error);
      }

      // Update the original application message to show interview started
      const updatedEmbed = {
        ...embed.data,
        color: 0xffff00, // Yellow for in progress
        fields: [
          ...(embed.data.fields || []),
          {
            name: '🎤 Interview Status',
            value: `Interview channel created by ${interaction.user}\nChannel: ${interviewChannel}`,
            inline: false,
          },
        ],
      };

      await message.edit({
        embeds: [updatedEmbed],
        components: [], // Remove the button since interview is started
      });

      // Send notification in the application channel (only if it's a text channel)
      if (interaction.channel && 'send' in interaction.channel) {
        await interaction.channel.send({
          content: `🎤 **Interview Started**\n\n${interaction.user} has created an interview channel for ${applicant}.\n\n**Interview Channel:** ${interviewChannel}\n**Applicant notified:** ✅`,
        });
      }

      await interaction.editReply({
        content: `✅ Interview channel created: ${interviewChannel}\n🔔 Applicant ${applicant} has been notified.`,
      });

      logger.info(`Interview channel created for application ${applicationId} by ${interaction.user.tag}: ${interviewChannel.name}`);

    } catch (error) {
      logger.error('Error handling interview button:', error);
      if (interaction.deferred) {
        await interaction.editReply('❌ Failed to start interview. Please try again or use the slash command.');
      } else {
        await interaction.reply({
          content: '❌ Failed to start interview. Please try again or use the slash command.',
          ephemeral: true,
        });
      }
    }
  }

  private generateInterviewChannelName(displayName: string): string {
    // Clean the display name and create interview channel name
    const cleanName = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 20) // Leave room for "Interview: " prefix
      .replace(/^-|-$/g, '');

    return `Interview: ${cleanName}`;
  }
}

export default ApplicationButtonHandler;
